# CoinGecko MCP Server

This package provides a Model Context Protocol (MCP) server that acts as a proxy to the public CoinGecko API v3. It allows AI assistants (like Cursor) to interact with the CoinGecko API through the defined OpenAPI specification.

## Features

*   Implements the Model Context Protocol for standardized communication.
*   Uses the official [CoinGecko API v3](https://docs.coingecko.com/v3.0.1/reference/introduction).
*   Parses the OpenAPI specification to dynamically generate API methods.
*   Can be run locally and configured within environments like Cursor.

## Installation & Usage (After Publishing)

Once this package is published to npm (e.g., as `@your-username/coingecko-mcp-server`), you can configure it in tools like Cursor without needing to clone the repository directly.

1.  **Ensure Node.js is installed.**
2.  **Add to Cursor Configuration:**
    Open your Cursor settings (`Cmd/Ctrl + Shift + P` -> "Cursor: Configure MCP Servers (JSON)"). Add an entry for this server:

    ```json
    {
      "mcpServers": {
        // ... other servers ...

        "coingecko": {
          "command": "npx",
          "args": [
            "-y", // Ensures the package is downloaded/updated
            "@nic0xflamel/coingecko-mcp-server", // Replace with actual published package name
            "--base-url", // Optional: Override the default base URL if needed
            "https://pro-api.coingecko.com/api/v3" // Example: Using Pro API
          ],
          "env": {
            // Alternative: Set Base URL via environment variable
            // "BASE_URL": "https://api.coingecko.com/api/v3",
            // Add API Key if using Pro API
            // "X_CG_PRO_API_KEY": "YOUR_API_KEY"
          }
        }
        // ... other servers ...
      }
    }
    ```

    *   Replace `@nic0xflamel/coingecko-mcp-server` with the actual published package name.
    *   The `BASE_URL` defaults to the public CoinGecko API (`https://api.coingecko.com/api/v3`). You can override it using the `--base-url` argument or the `BASE_URL` environment variable (the argument takes precedence).
    *   If using the CoinGecko Pro API, set the `X_CG_PRO_API_KEY` environment variable with your key.
3.  **Restart Cursor:** Cursor needs to be restarted to pick up the new server configuration.

## Development (Local Setup)

1.  Clone the repository: `git clone <repo-url>`
2.  Navigate to the server directory: `cd notion-automation/coingecko-mcp-server`
3.  Install dependencies: `npm install`
4.  Build the server: `npm run build`
5.  Run locally (for testing, uses stdin/stdout):
    *   Set environment variables if needed: `export BASE_URL=...`
    *   Run: `node build/scripts/start-server.js`

## Configuration

The server primarily requires the `BASE_URL` for the CoinGecko API.

*   **Default:** `https://api.coingecko.com/api/v3`
*   **Override via Command Line:** Use the `--base-url <URL>` argument when running via `npx` or `node`.
*   **Override via Environment Variable:** Set the `BASE_URL` environment variable.
*   **Pro API Key:** If using the Pro API, set the `X_CG_PRO_API_KEY` environment variable. The server will automatically include this as an `x-cg-pro-api-key` header in requests.

## License

MIT (You should add a LICENSE file to the project root or this directory)
