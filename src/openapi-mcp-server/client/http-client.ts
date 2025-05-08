import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'
import OpenAPIClientAxios from 'openapi-client-axios'
import type { AxiosInstance } from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { isFileUploadParameter } from '../openapi/file-upload.js'

export type HttpClientConfig = {
  baseUrl: string
  headers?: Record<string, string>
}

export type HttpClientResponse<T = any> = {
  data: T
  status: number
  headers: Headers
}

export class HttpClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: any,
    public headers?: Headers,
  ) {
    super(`${status} ${message}`)
    this.name = 'HttpClientError'
  }
}

export class HttpClient {
  private api: Promise<AxiosInstance>
  private client: OpenAPIClientAxios

  constructor(config: HttpClientConfig, openApiSpec: OpenAPIV3.Document | OpenAPIV3_1.Document) {
    // @ts-expect-error
    this.client = new (OpenAPIClientAxios.default ?? OpenAPIClientAxios)({
      definition: openApiSpec,
      axiosConfigDefaults: {
        baseURL: config.baseUrl,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'defillama-mcp-server',
          ...config.headers,
        },
      },
    })
    this.api = this.client.init()
  }

  private async prepareFileUpload(operation: OpenAPIV3.OperationObject, params: Record<string, any>): Promise<FormData | null> {
    const fileParams = isFileUploadParameter(operation)
    if (fileParams.length === 0) return null

    const formData = new FormData()

    // Handle file uploads
    for (const param of fileParams) {
      const filePath = params[param]
      if (!filePath) {
        throw new Error(`File path must be provided for parameter: ${param}`)
      }
      switch (typeof filePath) {
        case 'string':
          addFile(param, filePath)
          break
        case 'object':
          if(Array.isArray(filePath)) {
            let fileCount = 0
            for(const file of filePath) {
              addFile(param, file)
              fileCount++
            }
            break
          }
          //deliberate fallthrough
        default:
          throw new Error(`Unsupported file type: ${typeof filePath}`)
      }
      function addFile(name: string, filePath: string) {
          try {
            const fileStream = fs.createReadStream(filePath)
            formData.append(name, fileStream)
        } catch (error) {
          throw new Error(`Failed to read file at ${filePath}: ${error}`)
        }
      }
    }

    // Add non-file parameters to form data
    for (const [key, value] of Object.entries(params)) {
      if (!fileParams.includes(key)) {
        formData.append(key, value)
      }
    }

    return formData
  }

  /**
   * Execute an OpenAPI operation
   */
  async executeOperation<T = any>(
    operation: OpenAPIV3.OperationObject & { method: string; path: string },
    params: Record<string, any> = {},
  ): Promise<HttpClientResponse<T>> {
    const axios = await this.client.getAxiosInstance(); // Get the underlying Axios instance

    // Handle file uploads if present
    const formData = await this.prepareFileUpload(operation, params)

    // Separate parameters based on their location
    const pathParams: Record<string, any> = {};
    const queryParams: Record<string, any> = {};
    let requestBody: any = formData || undefined; // Start with formData or undefined
    const requestHeaders: Record<string, string> = formData ? formData.getHeaders() : {};

    const processedParams = new Set<string>();

    // Extract path and query parameters based on operation definition
    if (operation.parameters) {
      for (const param of operation.parameters) {
        if ('name' in param && param.name && params[param.name] !== undefined) {
          if (param.in === 'path') {
            pathParams[param.name] = params[param.name];
            processedParams.add(param.name);
          } else if (param.in === 'query') {
            queryParams[param.name] = params[param.name];
            processedParams.add(param.name);
          } else if (param.in === 'header') {
            requestHeaders[param.name] = params[param.name];
            processedParams.add(param.name);
              }
          // We ignore cookie parameters for typical server-side API calls
        }
      }
    }

    // Determine request body if not using formData
    if (!formData) {
      if (operation.requestBody) {
        // If the schema expects an object, collect unprocessed params
        // This assumes simple cases where top-level args match body properties
        // or a single 'body' arg contains the object.
        // More complex requestBody schemas might need more sophisticated mapping.
        if (params['body']) { // Check if a specific 'body' argument exists
            requestBody = params['body'];
            processedParams.add('body');
        } else {
             // Collect remaining params as body properties
            const bodyData: Record<string, any> = {};
            for(const key in params) {
                if (!processedParams.has(key)) {
                    bodyData[key] = params[key];
                }
            }
            if (Object.keys(bodyData).length > 0) {
                requestBody = bodyData;
            }
        }

        // Set Content-Type for JSON if we have a body
        if (requestBody) {
            requestHeaders['Content-Type'] = 'application/json';
        }

      } else {
        // If no requestBody is defined in OpenAPI, treat remaining params as query params (common for GET)
        for (const key in params) {
          if (!processedParams.has(key)) {
            queryParams[key] = params[key];
          }
        }
      }
    }

    // Construct the full URL
    let url = operation.path;
    for (const [key, value] of Object.entries(pathParams)) {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    }

    try {
      const requestConfig = {
            method: operation.method.toUpperCase(),
            url: url,
            params: queryParams,
            data: requestBody,
            headers: requestHeaders,
            // Ensure axios does not automatically transform binary data
            ...(formData && { responseType: 'arraybuffer' as const }),
        };

        const response = await axios.request(requestConfig);

      // Convert axios headers to Headers object
        const responseHeaders = new Headers();
      Object.entries(response.headers).forEach(([key, value]) => {
            if (value) responseHeaders.append(key, value.toString());
        });

        // Handle potential binary data response if formData was used
        let responseData = response.data;
        if (formData && response.data instanceof ArrayBuffer) {
            // Assuming binary response should be returned as base64 string or similar
            // Adjust based on expected MCP client handling
            responseData = Buffer.from(response.data).toString('base64'); 
        }

      return {
            data: responseData,
        status: response.status,
        headers: responseHeaders,
        };
    } catch (error: any) {
      if (error.response) {
        console.error('Error in http client', error)
        const headers = new Headers()
        Object.entries(error.response.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString())
        })

        throw new HttpClientError(error.response.statusText || 'Request failed', error.response.status, error.response.data, headers)
      }
      throw error
    }
  }
}
