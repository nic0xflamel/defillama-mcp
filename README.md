# DefiLlama MCP Server
[![smithery badge](https://smithery.ai/badge/@nic0xflamel/defillama-mcp-server)](https://smithery.ai/server/@nic0xflamel/defillama-mcp-server)

This package provides a Model Context Protocol (MCP) server that acts as a proxy to the public DefiLlama API. It allows AI assistants (like Cursor) to interact with the DefiLlama API through the defined OpenAPI specification.

## Features

*   Dynamically generates MCP tools from the DefiLlama OpenAPI specification.
*   Uses the official [DefiLlama API](https://defillama.com/docs/api).
*   Translates MCP `callTool` requests into HTTP requests to the DefiLlama API.
*   Handles responses and errors from the API.

## Installation & Usage

### Using npx (Recommended for Clients like Cursor)

Once published to npm, you can configure clients like Cursor to automatically download and run the server using `npx`. Add an entry to your client's MCP configuration (e.g., `mcp.json`):

```json
{
  "mcpServers": {
    "defillama": { 
      "command": "npx",
      "args": [
        "-y", // Ensures the latest version is used without prompting
        "@nic0xflamel/defillama-mcp-server"
        // Add any server-specific arguments here if needed in the future
      ]
    }
    // ... other servers
  }
}
```
*Replace `"defillama"` with your desired server name key.* 

### Using Smithery (for Claude Desktop)

To install automatically via [Smithery](https://smithery.ai/server/@nic0xflamel/defillama-mcp-server):

```bash
npx -y @smithery/cli install @nic0xflamel/defillama-mcp-server --client claude
```

### Manual / Development

1.  Clone the repository.
2.  Run `npm install`.
3.  Run `npm run build`.
4.  Start the server: `npm start` or use the linked command `defillama-mcp-server` (after running `npm link`).
5.  Configure your MCP client to connect via `stdio` using the appropriate command (see `npx` example above, adapting for local paths or linked command if not using `npx`).

## License

MIT (A LICENSE file exists in the project root)
