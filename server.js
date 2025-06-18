const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Endpoint para n8n
app.all('/sse', (req, res) => {
  if (req.method === 'GET') {
    // SSE connection
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('data: {"status":"connected"}\n\n');
  } else {
    // n8n tools request
    res.json({
      tools: [{
        name: "brave_search",
        description: "Search the web using Brave API"
      }]
    });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Brave MCP Server is running!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
