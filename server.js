const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
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

// Store active SSE connections
const activeConnections = new Set();

// SSE endpoint - Railway-optimized
app.get('/sse', (req, res) => {
  console.log('=== SSE Connection Initiated ===');
  
  // Railway-specific SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
    'X-Content-Type-Options': 'nosniff',
    'Transfer-Encoding': 'chunked'
  });

  // Immediate response for Railway
  res.write('event: connection\n');
  res.write('data: {"type":"connection","status":"connected"}\n\n');
  
  // Add to active connections
  activeConnections.add(res);
  
  // More frequent keep-alive for Railway (every 10 seconds)
  const keepAlive = setInterval(() => {
    if (!res.destroyed && res.writable) {
      try {
        res.write('event: ping\n');
        res.write('data: {"type":"ping","timestamp":' + Date.now() + '}\n\n');
      } catch (err) {
        console.log('Keep-alive error:', err.message);
        clearInterval(keepAlive);
        activeConnections.delete(res);
      }
    }
  }, 10000);

  // Heartbeat for Railway connection stability
  const heartbeat = setInterval(() => {
    if (!res.destroyed && res.writable) {
      try {
        res.write(':\n\n'); // Comment-only heartbeat
      } catch (err) {
        console.log('Heartbeat error:', err.message);
        clearInterval(heartbeat);
        clearInterval(keepAlive);
        activeConnections.delete(res);
      }
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
    console.log('SSE connection error:', err.message);
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });

  // Railway-specific: Handle aborted connections
  req.on('aborted', () => {
    console.log('SSE connection aborted');
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });

  // Additional cleanup for Railway
  res.on('close', () => {
    console.log('SSE response closed');
    clearInterval(keepAlive);
    clearInterval(heartbeat);
    activeConnections.delete(res);
  });
});

// MCP JSON-RPC endpoint
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
        message: 'Invalid Request - Missing or invalid jsonrpc version'
      }
    });
  }

  // Handle different MCP methods
  try {
    switch (request.method) {
      case 'initialize':
        console.log('Handling MCP initialize');
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: {},
              prompts: {}
            },
            serverInfo: {
              name: 'brave-mcp-server',
              version: '1.0.0'
            }
          }
        });
        break;

      case 'notifications/initialized':
        console.log('Handling MCP initialized notification');
        // Notifications don't require a response
        res.status(200).end();
        break;

      case 'tools/list':
        console.log('Handling MCP tools/list');
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
        break;

      case 'tools/call':
        console.log('Handling MCP tools/call');
        const toolName = request.params?.name;
        const toolArgs = request.params?.arguments || {};
        
        if (toolName === 'brave_search') {
          // Simulate search results (you can implement real Brave API here)
          res.json({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [{
                type: 'text',
                text: `Search results for: "${toolArgs.query}"\n\n1. Sample result 1 - This is a simulated search result\n2. Sample result 2 - Another simulated result\n3. Sample result 3 - Third simulated result`
              }],
              isError: false
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
        break;

      case 'ping':
        console.log('Handling MCP ping');
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {}
        });
        break;

      default:
        console.log('Unknown MCP method:', request.method);
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`
          }
        });
    }
  } catch (error) {
    console.error('Error processing MCP request:', error);
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Brave MCP Server is running!',
    protocol: 'MCP 2024-11-05',
    endpoints: {
      sse: '/sse',
      messages: '/messages'
    },
    activeConnections: activeConnections.size
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  activeConnections.forEach(res => {
    if (!res.destroyed) {
      res.write('data: {"type":"shutdown"}\n\n');
      res.end();
    }
  });
  process.exit(0);
});

app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
  console.log(`SSE endpoint: /sse`);
  console.log(`Messages endpoint: /messages`);
});
