#!/usr/bin/env node
const path = require('node:path');

// In CommonJS, __filename and __dirname are available globally

(async () => {
  // Dynamically import the ESM start script
  // Resolve the path relative to the current CJS script's directory (scripts/)
  // Go up one level(../) then into bin/scripts/
  const startServerPath = path.resolve(__dirname, '../bin/scripts/start-server.js');
  try {
    // We need to convert the file path to a file URL for dynamic import()
    const startServerUrl = new URL(`file://${startServerPath}`);
    const { startServer } = await import(startServerUrl.href);
    // Assuming startServer doesn't need to be explicitly called here
    // If it does need calling, uncomment the next line:
    // await startServer(); 
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})(); 