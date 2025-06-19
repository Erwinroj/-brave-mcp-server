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

// HTTP Streamable endpoint for MCP
app.post('/stream', (req, res) => {
  console.log('=== MCP HTTP Streamable Request ===');
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
    res.status(200).json({});
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

// Keep SSE endpoint for backward compatibility (but now deprecated)
app.get('/sse', (req, res) => {
  console.log('SSE Connection Initiated (deprecated - use /stream instead)');
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(': SSE connection established\n\n');
  
  const keepAlive = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 10000);

  req.on('close', () => {
    console.log('SSE connection closed');
    clearInterval(keepAlive);
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Brave MCP Server is running!',
    endpoints: {
      stream: '/stream (HTTP Streamable - recommended)',
      sse: '/sse (Server-Sent Events - deprecated)'
    }
  });
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
  console.log(`HTTP Streamable endpoint: /stream (recommended)`);
  console.log(`SSE endpoint: /sse (deprecated)`);
});
