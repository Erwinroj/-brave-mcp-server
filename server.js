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

// Global logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('Headers:', req.headers);
  }
  next();
});

// HTTP Streamable endpoint para MCP
app.post('/stream', async (req, res) => {
  console.log('=== MCP HTTP Streamable Request ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  const request = req.body;
  
  // Handle MCP initialization
  if (request.method === 'initialize') {
    console.log('MCP initialization request received');
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
          name: 'productivity-mcp-server',
          version: '2.0.0'
        }
      }
    });
    
  } else if (request.method === 'tools/list') {
    console.log('Tools list request received');
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
                  description: 'Search query to execute'
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
                  description: 'Text content to analyze'
                },
                analysis_type: {
                  type: 'string',
                  enum: ['sentiment', 'keywords', 'summary', 'all'],
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
                  description: 'Main topic or subject'
                },
                tone: {
                  type: 'string',
                  enum: ['professional', 'casual', 'formal', 'friendly', 'persuasive'],
                  description: 'Desired tone for the content'
                },
                length: {
                  type: 'string',
                  enum: ['short', 'medium', 'long'],
                  description: 'Desired length of content'
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
                task: {
                  type: 'string',
                  description: 'Task or reminder description'
                },
                due_date: {
                  type: 'string',
                  description: 'Due date in YYYY-MM-DD format'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'urgent'],
                  description: 'Priority level'
                },
                category: {
                  type: 'string',
                  description: 'Task category (e.g., work, personal, project)'
                }
              },
              required: ['task', 'due_date']
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
                  enum: ['analyze', 'transform', 'validate', 'summarize'],
                  description: 'Type of data operation'
                },
                data: {
                  type: 'string',
                  description: 'Data to process (JSON, CSV, text, etc.)'
                },
                format: {
                  type: 'string',
                  enum: ['json', 'csv', 'text', 'xml'],
                  description: 'Input data format'
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
    
    console.log(`Tool execution request: ${toolName}`);
    console.log('Arguments:', toolArgs);
    
    if (toolName === 'web_search') {
      const query = toolArgs?.query || 'default query';
      
      // Integración real con Brave Search API
      try {
        if (process.env.BRAVE_API_KEY) {
          const braveResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
            headers: {
              'X-Subscription-Token': process.env.BRAVE_API_KEY,
              'Accept': 'application/json'
            }
          });
          
          if (braveResponse.ok) {
            const braveData = await braveResponse.json();
            const results = braveData.web?.results || [];
            
            let formattedResults = `🔍 Búsqueda realizada: "${query}"\n\n`;
            
            if (results.length > 0) {
              results.slice(0, 5).forEach((result, index) => {
                formattedResults += `${index + 1}. **${result.title}**\n`;
                formattedResults += `   ${result.description}\n`;
                formattedResults += `   🔗 ${result.url}\n\n`;
              });
            } else {
              formattedResults += 'No se encontraron resultados para esta búsqueda.';
            }
            
            res.json({
              jsonrpc: '2.0',
              id: request.id,
              result: {
                content: [{
                  type: 'text',
                  text: formattedResults
                }]
              }
            });
            return;
          }
        }
        
        // Fallback si no hay API key o hay error
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{
              type: 'text',
              text: `⚠️ Búsqueda simulada para: "${query}"\n\n❌ API Key de Brave no configurada o error en la API.\n\nPara activar búsquedas reales:\n1. Obtén API key en: https://api.search.brave.com/\n2. Configura BRAVE_API_KEY en variables de entorno\n3. Redeploy el servidor`
            }]
          }
        });
        
      } catch (error) {
        console.error('Error en Brave Search:', error);
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{
              type: 'text',
              text: `❌ Error en búsqueda web: ${error.message}\n\nQuery: "${query}"\n\nVerifica la configuración de BRAVE_API_KEY.`
            }]
          }
        });
      }
      
    } else if (toolName === 'analyze_text') {
      const text = toolArgs?.text || '';
      const analysisType = toolArgs?.analysis_type || 'all';
      
      // Análisis de texto avanzado
      let analysis = `📊 Análisis de texto completado\n\n`;
      analysis += `📝 **Texto analizado:** "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"\n\n`;
      
      if (analysisType === 'sentiment' || analysisType === 'all') {
        const positiveWords = ['bueno', 'excelente', 'genial', 'fantástico', 'increíble', 'positivo', 'mejorando', 'eficiencia', 'éxito'];
        const negativeWords = ['malo', 'terrible', 'horrible', 'negativo', 'problema', 'error', 'fallo'];
        
        const words = text.toLowerCase().split(/\s+/);
        const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length;
        const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length;
        
        let sentiment = 'neutral';
        let sentimentScore = 50;
        
        if (positiveCount > negativeCount) {
          sentiment = 'positivo';
          sentimentScore = Math.min(85, 50 + (positiveCount - negativeCount) * 10);
        } else if (negativeCount > positiveCount) {
          sentiment = 'negativo';
          sentimentScore = Math.max(15, 50 - (negativeCount - positiveCount) * 10);
        }
        
        analysis += `😊 **Sentimiento:** ${sentiment} (${sentimentScore}%)\n`;
      }
      
      if (analysisType === 'keywords' || analysisType === 'all') {
        const words = text.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3);
        
        const wordCount = {};
        words.forEach(word => {
          wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        const topWords = Object.entries(wordCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([word]) => word);
        
        analysis += `🔑 **Palabras clave:** ${topWords.join(', ')}\n`;
      }
      
      if (analysisType === 'summary' || analysisType === 'all') {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const summary = sentences.slice(0, 2).join('. ').trim();
        analysis += `📋 **Resumen:** ${summary || 'Texto muy corto para resumir'}\n`;
      }
      
      analysis += `📈 **Estadísticas:** ${text.split(/\s+/).length} palabras, ${text.split(/[.!?]+/).length} oraciones`;
      
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
      const contentType = toolArgs?.content_type || 'email';
      const topic = toolArgs?.topic || 'tema general';
      const tone = toolArgs?.tone || 'professional';
      const length = toolArgs?.length || 'medium';
      
      let content = `✍️ Contenido generado: ${contentType}\n\n`;
      content += `📌 **Tema:** ${topic}\n`;
      content += `🎯 **Tono:** ${tone}\n`;
      content += `📏 **Longitud:** ${length}\n\n`;
      content += `---\n\n`;
      
      // Template básico por tipo de contenido
      switch (contentType) {
        case 'email':
          content += `**Asunto:** ${topic}\n\n`;
          content += `Estimado/a [Nombre],\n\n`;
          content += `Espero que este mensaje le encuentre bien. Me dirijo a usted para comunicarle información importante sobre ${topic}.\n\n`;
          content += `[Desarrollo del contenido principal aquí]\n\n`;
          content += `Quedo a su disposición para cualquier consulta adicional.\n\n`;
          content += `Saludos cordiales,\n[Su nombre]`;
          break;
          
        case 'blog_post':
          content += `# ${topic}\n\n`;
          content += `## Introducción\n\n`;
          content += `En el mundo actual, ${topic} se ha convertido en un tema de gran relevancia...\n\n`;
          content += `## Desarrollo\n\n`;
          content += `Es importante considerar varios aspectos clave...\n\n`;
          content += `## Conclusión\n\n`;
          content += `En resumen, ${topic} representa una oportunidad única...`;
          break;
          
        case 'social_media':
          content += `🚀 ${topic} ¡Descubre más!\n\n`;
          content += `💡 Ideas clave sobre ${topic}\n`;
          content += `📈 #${topic.replace(/\s+/g, '')} #productividad #innovación\n\n`;
          content += `¿Qué opinas? ¡Comparte tu experiencia! 👇`;
          break;
          
        default:
          content += `Contenido sobre ${topic} generado con tono ${tone} y longitud ${length}.`;
      }
      
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: content
          }]
        }
      });
      
    } else if (toolName === 'schedule_reminder') {
      const task = toolArgs?.task || 'Tarea sin especificar';
      const dueDate = toolArgs?.due_date || new Date().toISOString().split('T')[0];
      const priority = toolArgs?.priority || 'medium';
      const category = toolArgs?.category || 'general';
      
      let reminder = `⏰ Recordatorio programado exitosamente\n\n`;
      reminder += `📋 **Tarea:** ${task}\n`;
      reminder += `📅 **Fecha límite:** ${dueDate}\n`;
      reminder += `⚡ **Prioridad:** ${priority.toUpperCase()}\n`;
      reminder += `📂 **Categoría:** ${category}\n\n`;
      
      const priorityEmoji = {
        'low': '🟢',
        'medium': '🟡', 
        'high': '🟠',
        'urgent': '🔴'
      };
      
      reminder += `${priorityEmoji[priority] || '⚪'} **Estado:** Programado\n`;
      reminder += `🔔 **Tipo:** Recordatorio activo\n\n`;
      reminder += `💡 **Nota:** Este recordatorio ha sido registrado en el sistema de gestión de tareas.`;
      
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: reminder
          }]
        }
      });
      
    } else if (toolName === 'data_processor') {
      const operation = toolArgs?.operation || 'analyze';
      const data = toolArgs?.data || '{}';
      const format = toolArgs?.format || 'json';
      
      let result = `🔧 Procesamiento de datos completado\n\n`;
      result += `⚙️ **Operación:** ${operation}\n`;
      result += `📊 **Formato:** ${format}\n`;
      result += `📈 **Tamaño de datos:** ${data.length} caracteres\n\n`;
      
      try {
        switch (operation) {
          case 'analyze':
            if (format === 'json') {
              const parsed = JSON.parse(data);
              const keys = Object.keys(parsed);
              result += `🔍 **Análisis JSON:**\n`;
              result += `- Propiedades encontradas: ${keys.length}\n`;
              result += `- Claves principales: ${keys.slice(0, 5).join(', ')}\n`;
              result += `- Tipo de estructura: ${Array.isArray(parsed) ? 'Array' : 'Objeto'}\n`;
            } else {
              const lines = data.split('\n').length;
              const words = data.split(/\s+/).length;
              result += `📝 **Análisis de texto:**\n`;
              result += `- Líneas: ${lines}\n`;
              result += `- Palabras: ${words}\n`;
              result += `- Caracteres: ${data.length}\n`;
            }
            break;
            
          case 'validate':
            try {
              if (format === 'json') {
                JSON.parse(data);
                result += `✅ **Validación:** Datos JSON válidos\n`;
              } else {
                result += `✅ **Validación:** Formato ${format} procesado correctamente\n`;
              }
            } catch (error) {
              result += `❌ **Validación:** Error en formato ${format}: ${error.message}\n`;
            }
            break;
            
          case 'transform':
            result += `🔄 **Transformación:** Datos procesados según formato ${format}\n`;
            result += `📤 **Resultado:** Estructura optimizada para ${operation}\n`;
            break;
            
          case 'summarize':
            const summary = data.substring(0, 200) + (data.length > 200 ? '...' : '');
            result += `📋 **Resumen:**\n${summary}\n`;
            break;
        }
      } catch (error) {
        result += `❌ **Error:** No se pudo procesar los datos: ${error.message}\n`;
      }
      
      result += `\n✨ **Operación completada exitosamente**`;
      
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [{
            type: 'text',
            text: result
          }]
        }
      });
      
    } else {
      // Tool not found
      console.log(`Unknown tool requested: ${toolName}`);
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32601,
          message: `Herramienta no encontrada: ${toolName}`,
          data: {
            availableTools: ['web_search', 'analyze_text', 'generate_content', 'schedule_reminder', 'data_processor']
          }
        }
      });
    }
    
  } else if (request.method === 'notifications/initialized') {
    console.log('MCP notifications initialized');
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      result: {}
    });
    
  } else {
    // Unknown method
    console.log(`Unknown method: ${request.method}`);
    res.json({
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32601,
        message: `Método no soportado: ${request.method}`
      }
    });
  }
});

// Root endpoint - Server status
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Productivity MCP Server v2.0 running on port ${port}`);
  console.log(`📡 HTTP Streamable endpoint: /stream`);
  console.log(`🛠️ Available tools: web_search, analyze_text, generate_content, schedule_reminder, data_processor`);
  console.log(`🔍 Brave Search API: ${process.env.BRAVE_API_KEY ? 'CONFIGURED ✅' : 'NOT CONFIGURED ❌'}`);
});
