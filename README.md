# CoinGecko MCP Server
[![smithery badge](https://smithery.ai/badge/@nic0xflamel/coingecko-mcp-server)](https://smithery.ai/server/@nic0xflamel/coingecko-mcp-server)

This package provides a Model Context Protocol (MCP) server that acts as a proxy to the public CoinGecko API v3. It allows AI assistants (like Cursor) to interact with the CoinGecko API through the defined OpenAPI specification.

## Features

*   Implements the Model Context Protocol for standardized communication.
*   Uses the official [CoinGecko API v3](https://docs.coingecko.com/v3.0.1/reference/introduction).
*   Parses the OpenAPI specification to dynamically generate API methods.
*   Can be run locally and configured within environments like Cursor and Claude Desktop.

## Installation
### Installing via Smithery

To install CoinGecko API Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@nic0xflamel/coingecko-mcp-server):

```bash
npx -y @smithery/cli install @nic0xflamel/coingecko-mcp-server --client claude
```

### Manual Installation
    ```json
    {
      "mcpServers": {
        "coingecko": {
          "command": "npx",
          "args": [
            "-y",
            "@nic0xflamel/coingecko-mcp-server"
          ]
        }
      }
    }
    ```

## License

MIT (You should add a LICENSE file to the project root or this directory)
