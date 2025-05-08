import path from 'node:path'
import { fileURLToPath } from 'url'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { initProxy, ValidationError } from '../src/init-server.js'

// Function to parse simple key-value arguments
function parseArgs(args: string[]): Record<string, string> {
  const parsedArgs: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      // Check if next arg exists and doesn't start with '--'
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsedArgs[key] = args[i + 1];
        i++; // Skip the value argument
      } else {
        // Treat as a boolean flag if no value follows
        parsedArgs[key] = "true";
      }
    }
  }
  return parsedArgs;
}

export async function startServer(args: string[] = process.argv.slice(2)) {
  const filename = fileURLToPath(import.meta.url)
  const directory = path.dirname(filename)
  const specPath = path.resolve(directory, '../../specs/defillama-api-spec.json')
  
  const proxy = await initProxy(specPath, undefined /* baseUrl is now always undefined */)
  await proxy.connect(new StdioServerTransport())

  return proxy.getServer()
}

startServer().catch(error => {
  if (error instanceof ValidationError) {
    console.error('Invalid OpenAPI 3.1 specification:')
    error.errors.forEach(err => console.error(err))
  } else {
    console.error('Error:', error)
  }
  process.exit(1)
})
