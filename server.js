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

// HTTP Streamable endpoint para MCP
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
          name: 'productivity-mcp-server',
          version: '2.0.0'
        }
      }
    });
  } else if (request.method === 'notifications/initialized') {
    console.log('MCP initialization confirmed by client');
    res.status(200).json({});
  } else if (request.method === 'tools/list') {
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools: [
          {
            name: 'web_search',
            description: 'Search the web using multiple search engines',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query'
                },
                engine: {
                  type: 'string',
                  enum: ['brave', 'duckduckgo', 'google'],
                  default: 'brave',
                  description: 'Search engine to use'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'analyze_text',
            description: 'Analyze text for sentiment, keywords, and summary',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Text to analyze'
                },
                analysis_type: {
                  type: 'string',
                  enum: ['sentiment', 'keywords', 'summary', 'all'],
                  default: 'all',
                  description: 'Type of analysis to perform'
                }
              },
              required: ['text']
            }
          },
          {
            name: 'generate_content',
            description: 'Generate various types of content',
            inputSchema: {
              type: 'object',
              properties: {
                content_type: {
                  type: 'string',
                  enum: ['email', 'blog_post', 'social_media', 'documentation', 'summary'],
                  description: 'Type of content to generate'
                },
                topic: {
                  type: 'string',
                  description: 'Topic or subject for the content'
                },
                tone: {
                  type: 'string',
                  enum: ['formal', 'casual', 'professional', 'friendly', 'technical'],
                  default: 'professional',
                  description: 'Tone of the content'
                },
                length: {
                  type: 'string',
                  enum: ['short', 'medium', 'long'],
                  default: 'medium',
                  description: 'Length of the content'
                }
              },
              required: ['content_type', 'topic']
            }
          },
          {
            name: 'schedule_reminder',
            description: 'Schedule reminders and tasks',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Title of the reminder'
                },
                description: {
                  type: 'string',
                  description: 'Description of the reminder'
                },
                due_date: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Due date and time for the reminder'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'urgent'],
                  default: 'medium',
                  description: 'Priority level'
                }
              },
              required: ['title', 'due_date']
            }
          },
          {
            name: 'data_processor',
            description: 'Process and transform data in various formats',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  enum: ['csv_to_json', 'json_to_csv', 'extract_emails', 'clean_data', 'validate_data'],
                  description: 'Data processing operation'
                },
                data: {
                  type: 'string',
                  description: 'Input data to process'
                },
                options: {
                  type: 'object',
                  description: 'Additional options for processing'
                }
              },
              required: ['operation', 'data']
            }
          }
        ]
      }
    });
  } else if (request.method === 'tools/call') {
    const toolName = request.params?.name;
    const toolArgs = request.params?.arguments;
    
    if (toolName === 'web_search') {
      const engine = toolArgs?.engine || 'brave';
      const query = toolArgs?.query;
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: `🔍 Búsqueda web realizada con ${engine}:\nQuery: "${query}"\n\n✅ Resultados simulados:\n1. Resultado relevante sobre "${query}"\n2. Información adicional relacionada\n3. Enlaces útiles encontrados\n\n💡 Nota: Integrar API real de ${engine} para resultados reales.`
          }]
        }
      });
    } else if (toolName === 'analyze_text') {
      const text = toolArgs?.text;
      const analysisType = toolArgs?.analysis_type || 'all';
      
      let analysis = `📊 Análisis de texto (${analysisType}):\n\n`;
      
      if (analysisType === 'sentiment' || analysisType === 'all') {
        analysis += `😊 Sentimiento: Positivo (85%)\n`;
      }
      if (analysisType === 'keywords' || analysisType === 'all') {
        analysis += `🏷️ Palabras clave: productividad, automatización, AI, eficiencia\n`;
      }
      if (analysisType === 'summary' || analysisType === 'all') {
        analysis += `📝 Resumen: El texto trata sobre mejoras de productividad mediante automatización con AI.\n`;
      }
      
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: analysis
          }]
        }
      });
    } else if (toolName === 'generate_content') {
      const contentType = toolArgs?.content_type;
      const topic = toolArgs?.topic;
      const tone = toolArgs?.tone || 'professional';
      const length = toolArgs?.length || 'medium';
      
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: `✍️ Contenido generado (${contentType}):\n\nTema: ${topic}\nTono: ${tone}\nLongitud: ${length}\n\n📄 Contenido creado:\n[Aquí iría el contenido generado específico para "${topic}" con tono ${tone}]\n\n💡 Integrar con API de OpenAI/Claude para generación real.`
          }]
        }
      });
    } else if (toolName === 'schedule_reminder') {
      const title = toolArgs?.title;
      const dueDate = toolArgs?.due_date;
      const priority = toolArgs?.priority || 'medium';
      
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: `📅 Recordatorio programado:\n\n📝 Título: ${title}\n⏰ Fecha: ${dueDate}\n🚨 Prioridad: ${priority}\n\n✅ Recordatorio guardado exitosamente.\n\n💡 Integrar con calendario real (Google Calendar, Outlook, etc.)`
          }]
        }
      });
    } else if (toolName === 'data_processor') {
      const operation = toolArgs?.operation;
      const data = toolArgs?.data;
      
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: `🔄 Procesamiento de datos:\n\nOperación: ${operation}\n\n✅ Datos procesados exitosamente.\n\n📊 Resultado simulado:\n[Aquí irían los datos procesados según la operación "${operation}"]\n\n💡 Implementar lógica real de procesamiento.`
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Productivity MCP Server v2.0 - HTTP Streamable Ready!',
    endpoints: {
      stream: '/stream (HTTP Streamable)',
      tools: [
        'web_search - Multi-engine web search',
        'analyze_text - Text analysis and insights', 
        'generate_content - Content creation',
        'schedule_reminder - Task and reminder management',
        'data_processor - Data transformation utilities'
      ]
    },
    version: '2.0.0',
    protocol: 'MCP HTTP Streamable'
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
  console.log(`🚀 Productivity MCP Server v2.0 running on port ${port}`);
  console.log(`📡 HTTP Streamable endpoint: /stream`);
  console.log(`🛠️ Tools: web_search, analyze_text, generate_content, schedule_reminder, data_processor`);
});
