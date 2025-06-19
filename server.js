const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Global request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Track active SSE connections
const activeConnections = new Set();

// SSE endpoint
app.get('/sse', (req, res) => {
  console.log('SSE Connection Initiated');
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  // Keep SSE connection open for MCP client to initiate
  res.write(': MCP SSE connection established\n\n');
  
  // Add to active connections
  activeConnections.add(res);
  
  // More frequent keep-alive for Railway (every 10 seconds)
  const keepAlive = setInterval(() => {
    if (!res.headersSent) {
      console.log('SSE keep-alive sent');
      res.write('event: ping\n');
      res.write('data: {"type":"ping"}\n\n');
    }
  }, 10000);

  // Additional heartbeat every 5 seconds
  const heartbeat = setInterval(() => {
    if (!res.headersSent) {
      res.write(': heartbeat\n\n');
    }
  }, 5000);

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE connection closed by client');
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });

  req.on('error', (err) => {
    console.log('SSE connection error:', err);
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });

  req.on('aborted', () => {
    console.log('SSE connection aborted');
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });
});

// MCP messages endpoint (POST)
app.post('/messages', (req, res) => {
  console.log('=== MCP JSON-RPC Request ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const request = req.body;
  
  // Validate JSON-RPC format
  if (!request.jsonrpc || request.jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      id: request.id || null,
      error: {
        code: -32600,
        message: 'Invalid Request - missing or invalid jsonrpc field'
      }
    });
  }

  if (request.method === 'initialize') {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'brave-mcp-server',
          version: '1.0.0'
        }
      }
    });
  } else if (request.method === 'notifications/initialized') {
    // Client confirming initialization - no response needed
    console.log('MCP initialization confirmed by client');
    res.status(200).end();
  } else if (request.method === 'tools/list') {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools: [{
          name: 'brave_search',
          description: 'Search the web using Brave Search API',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query'
              }
            },
            required: ['query']
          }
        }]
      }
    });
  } else if (request.method === 'tools/call') {
    // Handle tool execution
    const toolName = request.params?.name;
    const toolArgs = request.params?.arguments;
    
    if (toolName === 'brave_search') {
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: `Brave search results for: ${toolArgs?.query || 'undefined query'}`
          }]
        }
      });
    } else {
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Unknown tool: ${toolName}`
        }
      });
    }
  } else if (request.method === 'ping') {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: {}
    });
  } else {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32601,
        message: `Method not found: ${request.method}`
      }
    });
  }
});

// MCP messages endpoint (GET) - temporary for debugging
app.get('/messages', (req, res) => {
  console.log('MCP GET Request - This should not happen:', req.query);
  res.json({
    error: 'GET method not supported for /messages. Use POST instead.',
    note: 'This endpoint expects JSON-RPC 2.0 POST requests',
    availableMethods: ['initialize', 'tools/list', 'tools/call', 'ping']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Brave MCP Server is running!' });
});

// Handle OPTIONS requests for CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
  console.log(`SSE endpoint: /sse`);
  console.log(`Messages endpoint: /messages`);
});const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Global request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Track active SSE connections
const activeConnections = new Set();

// SSE endpoint
app.get('/sse', (req, res) => {
  console.log('SSE Connection Initiated');
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  // Keep SSE connection open for MCP client to initiate
  res.write(': MCP SSE connection established\n\n');
  
  // Add to active connections
  activeConnections.add(res);
  
  // More frequent keep-alive for Railway (every 10 seconds)
  const keepAlive = setInterval(() => {
    if (!res.headersSent) {
      console.log('SSE keep-alive sent');
      res.write('event: ping\n');
      res.write('data: {"type":"ping"}\n\n');
    }
  }, 10000);

  // Additional heartbeat every 5 seconds
  const heartbeat = setInterval(() => {
    if (!res.headersSent) {
      res.write(': heartbeat\n\n');
    }
  }, 5000);

  // Handle client disconnect
  req.on('close', () => {
    console.log('SSE connection closed by client');
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });

  req.on('error', (err) => {
    console.log('SSE connection error:', err);
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });

  req.on('aborted', () => {
    console.log('SSE connection aborted');
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });
});

// MCP messages endpoint (POST)
app.post('/messages', (req, res) => {
  console.log('=== MCP JSON-RPC Request ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const request = req.body;
  
  // Validate JSON-RPC format
  if (!request.jsonrpc || request.jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      id: request.id || null,
      error: {
        code: -32600,
        message: 'Invalid Request - missing or invalid jsonrpc field'
      }
    });
  }

  if (request.method === 'initialize') {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'brave-mcp-server',
          version: '1.0.0'
        }
      }
    });
  } else if (request.method === 'notifications/initialized') {
    // Client confirming initialization - no response needed
    console.log('MCP initialization confirmed by client');
    res.status(200).end();
  } else if (request.method === 'tools/list') {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools: [{
          name: 'brave_search',
          description: 'Search the web using Brave Search API',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query'
              }
            },
            required: ['query']
          }
        }]
      }
    });
  } else if (request.method === 'tools/call') {
    // Handle tool execution
    const toolName = request.params?.name;
    const toolArgs = request.params?.arguments;
    
    if (toolName === 'brave_search') {
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: `Brave search results for: ${toolArgs?.query || 'undefined query'}`
          }]
        }
      });
    } else {
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Unknown tool: ${toolName}`
        }
      });
    }
  } else if (request.method === 'ping') {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: {}
    });
  } else {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32601,
        message: `Method not found: ${request.method}`
      }
    });
  }
});

// MCP messages endpoint (GET) - temporary for debugging
app.get('/messages', (req, res) => {
  console.log('MCP GET Request - This should not happen:', req.query);
  res.json({
    error: 'GET method not supported for /messages. Use POST instead.',
    note: 'This endpoint expects JSON-RPC 2.0 POST requests',
    availableMethods: ['initialize', 'tools/list', 'tools/call', 'ping']
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Brave MCP Server is running!' });
});

// Handle OPTIONS requests for CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
  console.log(`SSE endpoint: /sse`);
  console.log(`Messages endpoint: /messages`);
});
