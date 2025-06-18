const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Add CORS middleware
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

// SSE endpoint
app.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send MCP endpoint info
  res.write(`data: /sse\n\n`);
  
  // Keep alive
  const keepAlive = setInterval(() => {
    res.write(`data: \n\n`);
  }, 30000);
  
  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

// MCP messages endpoint (GET) - temporary for debugging
app.get('/messages', (req, res) => {
  console.log('MCP GET Request - This should not happen:', req.query);
  res.json({
    error: 'GET method not supported for /messages. Use POST instead.',
    received_method: 'GET',
    expected_method: 'POST',
    query_params: req.query,
    headers: req.headers
  });
});

// MCP messages endpoint (POST)
app.post('/messages', (req, res) => {
  console.log('MCP POST Request:', JSON.stringify(req.body, null, 2));
  
  const request = req.body;
  
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
  } else {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Brave MCP Server is running!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
