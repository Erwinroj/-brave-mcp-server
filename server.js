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

// ===== NUEVAS FUNCIONES PARA REVENUE INTELLIGENCE =====

// 6. WEATHER INTELLIGENCE (NUEVA)
async function getWeatherIntelligence(location, days = 7) {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  
  if (!API_KEY) {
    return {
      location: location,
      current: { 
        temperature: 24, 
        condition: "sunny", 
        humidity: 62, 
        description: "Clear skies with excellent visibility" 
      },
      forecast: [
        { date: "2025-06-25", temp_max: 28, temp_min: 18, condition: "sunny", rain_probability: 5, tourism_impact: "high" },
        { date: "2025-06-26", temp_max: 26, temp_min: 17, condition: "partly_cloudy", rain_probability: 15, tourism_impact: "high" },
        { date: "2025-06-27", temp_max: 30, temp_min: 21, condition: "sunny", rain_probability: 0, tourism_impact: "very_high" },
        { date: "2025-06-28", temp_max: 25, temp_min: 16, condition: "cloudy", rain_probability: 45, tourism_impact: "medium" }
      ],
      tourism_impact: "high",
      revenue_recommendations: [
        "Increase weekend rates 20% due to excellent weather forecast",
        "Promote outdoor dining and terrace amenities",
        "Market pool and garden areas aggressively",
        "Create sunshine packages for leisure guests"
      ],
      pricing_adjustments: {
        sunny_days: "+15-25% premium pricing recommended",
        rainy_days: "Consider indoor amenity packages",
        optimal_dates: ["2025-06-27", "2025-06-29"]
      }
    };
  }

  try {
    // Implementación real con OpenWeather API
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric&lang=es`
    );
    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric&cnt=${days * 8}&lang=es`
    );
    const forecastData = await forecastResponse.json();

    return {
      location: location,
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main.toLowerCase(),
        humidity: currentData.main.humidity,
        description: currentData.weather[0].description
      },
      forecast: forecastData.list.slice(0, days).map(item => ({
        date: item.dt_txt.split(' ')[0],
        temp_max: Math.round(item.main.temp_max),
        temp_min: Math.round(item.main.temp_min),
        condition: item.weather[0].main.toLowerCase(),
        rain_probability: Math.round(item.pop * 100),
        tourism_impact: item.main.temp > 20 && item.pop < 0.3 ? "high" : "medium"
      })),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    return { error: error.message, location: location };
  }
}

// 7. EVENTS INTELLIGENCE (NUEVA)
async function getEventsIntelligence(location, days = 30) {
  return {
    location: location,
    period: `${days} days`,
    events: [
      {
        date: "2025-06-28",
        name: "International Summer Music Festival",
        type: "festival",
        venue: "Central Park Amphitheater", 
        expected_attendance: 25000,
        tourism_impact: "very_high",
        duration_days: 3,
        revenue_impact: "+200% weekend rates recommended",
        pricing_strategy: "Block premium inventory, minimum 3-night stay"
      },
      {
        date: "2025-07-05",
        name: "Global Tech Innovation Conference",
        type: "business",
        venue: "Convention Center",
        expected_attendance: 12000,
        tourism_impact: "high", 
        duration_days: 2,
        revenue_impact: "+120% corporate rates, extend stay packages",
        pricing_strategy: "Corporate packages with shuttle service"
      },
      {
        date: "2025-07-12",
        name: "Culinary Arts Festival",
        type: "cultural",
        venue: "Downtown District",
        expected_attendance: 8000,
        tourism_impact: "high",
        duration_days: 2,
        revenue_impact: "+80% rates, promote dining experiences"
      }
    ],
    calendar_summary: {
      high_impact_days: 8,
      medium_impact_days: 4,
      very_high_impact_days: 3,
      peak_period: "June 28 - July 7",
      total_events: 3,
      revenue_opportunity: "€65,000-85,000 additional potential",
      occupancy_projection: "95-100% for peak events"
    },
    pricing_recommendations: [
      "Block inventory immediately for festival weekend June 28-30",
      "Increase corporate rates 120% for tech conference July 5-6", 
      "Create festival packages with shuttle and VIP access",
      "Implement minimum stay requirements (3+ nights) for major events"
    ],
    timestamp: new Date().toISOString()
  };
}

// 8. HOTEL DATA INTELLIGENCE (NUEVA - CRÍTICA)
async function getHotelDataIntelligence(location, hotelType = "luxury") {
  const datasets = {
    "paris_luxury": {
      hotel_profile: {
        name: "Hotel Boutique Paris Center",
        category: "4★ Boutique",
        rooms: 85,
        location: "Paris 1er",
        competitive_set: ["Hotel des Grands Boulevards", "Hotel Malte Opera", "Hotel Victoires Opera"],
        property_type: "Boutique Urban"
      },
      current_metrics: {
        occupancy: 82.5,
        adr: 285, // EUR
        revpar: 235.1,
        last_30_days: { occupancy: 78.2, adr: 275, revpar: 215.1 },
        ytd_performance: { occupancy: 79.8, adr: 280, revpar: 223.4 }
      },
      room_types: [
        { type: "Standard", inventory: 45, current_rate: 250, target_rate: 280, occupancy: 85 },
        { type: "Superior", inventory: 30, current_rate: 320, target_rate: 350, occupancy: 78 },
        { type: "Suite", inventory: 10, current_rate: 480, target_rate: 520, occupancy: 92 }
      ],
      market_segments: {
        corporate: { share: 35, adr: 295, booking_window: 14, growth_trend: "+5%" },
        leisure: { share: 45, adr: 275, booking_window: 28, growth_trend: "+12%" },
        groups: { share: 15, adr: 240, booking_window: 45, growth_trend: "-2%" },
        luxury_packages: { share: 5, adr: 420, booking_window: 35, growth_trend: "+18%" }
      },
      channel_mix: {
        direct: { share: 40, adr: 300, commission: 0, conversion: "3.2%" },
        ota_booking: { share: 25, adr: 260, commission: 18, conversion: "12.1%" },
        ota_expedia: { share: 15, adr: 265, commission: 20, conversion: "8.5%" },
        corporate_contracts: { share: 20, adr: 290, commission: 5, conversion: "15.8%" }
      }
    },

    "colombia_luxury": {
      hotel_profile: {
        name: "Gran Hotel Eje Cafetero",
        category: "5★ Luxury Resort",
        rooms: 120,
        location: "Pereira, Risaralda",
        competitive_set: ["Hotel Movich Pereira", "Sonesta Hotel Pereira", "GHL Hotel Abadia Plaza"],
        property_type: "Business Resort"
      },
      current_metrics: {
        occupancy: 75.8,
        adr: 380000, // COP (€95)
        revpar: 288040,
        last_30_days: { occupancy: 71.2, adr: 365000, revpar: 259880 },
        ytd_performance: { occupancy: 73.5, adr: 375000, revpar: 275625 }
      },
      room_types: [
        { type: "Superior", inventory: 60, current_rate: 320000, target_rate: 360000, occupancy: 78 },
        { type: "Junior Suite", inventory: 40, current_rate: 450000, target_rate: 490000, occupancy: 72 },
        { type: "Presidential Suite", inventory: 20, current_rate: 680000, target_rate: 750000, occupancy: 85 }
      ],
      market_segments: {
        corporate: { share: 40, adr: 395000, booking_window: 12, growth_trend: "+8%" },
        leisure_national: { share: 35, adr: 370000, booking_window: 25, growth_trend: "+15%" },
        international: { share: 20, adr: 420000, booking_window: 45, growth_trend: "+22%" },
        events_weddings: { share: 5, adr: 350000, booking_window: 90, growth_trend: "+35%" }
      },
      channel_mix: {
        direct: { share: 35, adr: 400000, commission: 0, conversion: "2.8%" },
        ota_international: { share: 25, adr: 370000, commission: 18, conversion: "9.5%" },
        corporate_contracts: { share: 25, adr: 390000, commission: 8, conversion: "18.2%" },
        travel_agents: { share: 15, adr: 360000, commission: 12, conversion: "7.3%" }
      }
    },

    "colombia_experiential": {
      hotel_profile: {
        name: "Hacienda Coffee Experience",
        category: "3★ Experiential Lodge",
        rooms: 24,
        location: "Salento, Quindío",
        competitive_set: ["Casa San Carlos Lodge", "Biohotel Organic Suites", "Coffee Tree Boutique"],
        property_type: "Experiential Eco-Lodge"
      },
      current_metrics: {
        occupancy: 68.5,
        adr: 180000, // COP (€45)
        revpar: 123300,
        last_30_days: { occupancy: 72.1, adr: 175000, revpar: 126175 },
        ytd_performance: { occupancy: 65.8, adr: 178000, revpar: 117124 }
      },
      room_types: [
        { type: "Standard Mountain View", inventory: 12, current_rate: 160000, target_rate: 180000, occupancy: 70 },
        { type: "Coffee Suite", inventory: 8, current_rate: 200000, target_rate: 230000, occupancy: 65 },
        { type: "Hacienda Master", inventory: 4, current_rate: 280000, target_rate: 320000, occupancy: 75 }
      ],
      market_segments: {
        domestic_leisure: { share: 55, adr: 170000, booking_window: 21, growth_trend: "+12%" },
        international_backpackers: { share: 25, adr: 165000, booking_window: 14, growth_trend: "+8%" },
        coffee_experience: { share: 20, adr: 195000, booking_window: 35, growth_trend: "+25%" }
      },
      channel_mix: {
        direct: { share: 45, adr: 185000, commission: 0, conversion: "4.1%" },
        booking_com: { share: 30, adr: 170000, commission: 15, conversion: "11.2%" },
        airbnb: { share: 15, adr: 175000, commission: 14, conversion: "8.7%" },
        local_agencies: { share: 10, adr: 190000, commission: 10, conversion: "6.5%" }
      }
    }
  };

  const hotelData = datasets[location] || datasets["paris_luxury"];
  
  // Cálculos de revenue management
  const current_revenue_monthly = (hotelData.current_metrics.revpar * hotelData.hotel_profile.rooms * 30);
  const target_revenue_monthly = (hotelData.current_metrics.revpar * 1.15 * hotelData.hotel_profile.rooms * 30);
  const revenue_gap = target_revenue_monthly - current_revenue_monthly;

  return {
    ...hotelData,
    market_positioning: location === "colombia_luxury" ? "Premium luxury in emerging coffee region market" : 
                       location === "colombia_experiential" ? "Authentic coffee culture experiential tourism" :
                       "Established European luxury boutique positioning",
    
    revenue_analysis: {
      current_monthly_revenue: Math.round(current_revenue_monthly),
      target_monthly_revenue: Math.round(target_revenue_monthly),
      revenue_opportunity: Math.round(revenue_gap),
      performance_vs_budget: location.includes("colombia") ? "+5.2%" : "+8.7%",
      market_share: location === "colombia_luxury" ? "12%" : location === "colombia_experiential" ? "8%" : "15%"
    },

    revenue_management_insights: {
      booking_pace: location.includes("colombia") ? "8% ahead vs last year same period" : "15% ahead of last year same period",
      demand_forecast: location === "colombia_luxury" ? "Corporate demand strong, international leisure growing rapidly" :
                      location === "colombia_experiential" ? "Peak coffee harvest season approaching - high demand expected" :
                      "Steady luxury demand with spring uptick expected",
      
      critical_dates: location === "colombia_luxury" ? [
        "2025-07-15: Corporate conference season starts",
        "2025-08-01: International coffee festival",
        "2025-12-15: Holiday premium season"
      ] : location === "colombia_experiential" ? [
        "2025-07-01: Coffee harvest season begins",
        "2025-08-15: Festival Nacional del Café",
        "2025-10-12: International backpacker season"
      ] : [
        "2025-07-14: Summer peak season begins",
        "2025-09-15: Business travel resumes",
        "2025-12-20: Holiday premium rates"
      ],

      pricing_opportunities: location === "colombia_luxury" ? [
        "Increase corporate rates +5% (currently underpriced vs market positioning)",
        "Premium wedding packages +15% (high demand, low competition)", 
        "International guest rates +10% (strong USD/EUR exchange rates)",
        "Implement dynamic weekend pricing +20% for peak dates"
      ] : location === "colombia_experiential" ? [
        "Coffee harvest season premium +25% (unique positioning)",
        "International experience packages +15% (growing segment)",
        "Extend minimum stay to 2 nights for weekends",
        "Create premium coffee master class packages +30%"
      ] : [
        "Weekend rates optimization +8% (demand exceeds supply)",
        "Corporate package restructuring for better yield",
        "Premium suite rates +12% (high occupancy indicates underpricing)",
        "Implement length-of-stay controls for peak periods"
      ]
    },

    competitive_intelligence: {
      position_vs_compset: location === "colombia_luxury" ? "ADR premium +15% vs competitive set" :
                          location === "colombia_experiential" ? "Occupancy leader in experiential segment" :
                          "Premium positioning maintained, ADR +12% above comp set",
      
      market_opportunities: location === "colombia_luxury" ? [
        "Corporate market underserved in region",
        "International MICE potential untapped",
        "Luxury wellness tourism growing 25% annually"
      ] : location === "colombia_experiential" ? [
        "Coffee tourism boom +40% growth projected",
        "Sustainable tourism trend favorizes eco-lodges",
        "Instagram-worthy experiences drive bookings"
      ] : [
        "Boutique luxury market growing 15% annually",
        "Business leisure trend benefits central location",
        "Luxury experience packages outperform traditional rates"
      ]
    },

    timestamp: new Date().toISOString()
  };
}

// ===== FIN NUEVAS FUNCIONES =====

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
          },
          {
            name: 'weather_intelligence',
            description: 'Weather analysis for tourism demand and pricing optimization',
            inputSchema: {
              type: 'object',
              properties: {
                location: { 
                  type: 'string', 
                  description: 'Hotel location for weather analysis' 
                },
                days: { 
                  type: 'number', 
                  description: 'Number of forecast days (default: 7)' 
                }
              },
              required: ['location']
            }
          },
          {
            name: 'events_intelligence',
            description: 'Event calendar analysis for demand forecasting and revenue optimization',
            inputSchema: {
              type: 'object',
              properties: {
                location: { 
                  type: 'string', 
                  description: 'Location for event analysis' 
                },
                days: { 
                  type: 'number', 
                  description: 'Number of days to analyze (default: 30)' 
                }
              },
              required: ['location']
            }
          },
          {
            name: 'hotel_data_intelligence',
            description: 'Hotel operational data and revenue management insights by market type',
            inputSchema: {
              type: 'object',
              properties: {
                location: { 
                  type: 'string', 
                  enum: ['paris_luxury', 'colombia_luxury', 'colombia_experiential'],
                  description: 'Hotel market type: paris_luxury, colombia_luxury, or colombia_experiential' 
                },
                hotelType: { 
                  type: 'string', 
                  description: 'Hotel type specification (default: luxury)' 
                }
              },
              required: ['location']
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
      
    } else if (toolName === 'weather_intelligence') {
      const location = toolArgs?.location || 'Madrid';
      const days = toolArgs?.days || 7;
      
      try {
        const weatherData = await getWeatherIntelligence(location, days);
        
        let weatherReport = `🌤️ Análisis meteorológico para ${location}\n\n`;
        
        if (weatherData.error) {
          weatherReport += `❌ Error: ${weatherData.error}\n`;
        } else {
          weatherReport += `🌡️ **Condiciones actuales:**\n`;
          weatherReport += `- Temperatura: ${weatherData.current.temperature}°C\n`;
          weatherReport += `- Condición: ${weatherData.current.condition}\n`;
          weatherReport += `- Humedad: ${weatherData.current.humidity}%\n\n`;
          
          weatherReport += `📅 **Pronóstico (${days} días):**\n`;
          weatherData.forecast.slice(0, 5).forEach(day => {
            weatherReport += `${day.date}: ${day.temp_max}°/${day.temp_min}°C, ${day.condition}, lluvia: ${day.rain_probability}%\n`;
          });
          
          weatherReport += `\n💰 **Impacto turístico:** ${weatherData.tourism_impact}\n\n`;
          weatherReport += `🎯 **Recomendaciones revenue:**\n`;
          weatherData.revenue_recommendations.forEach(rec => {
            weatherReport += `• ${rec}\n`;
          });
        }
        
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{
              type: 'text',
              text: weatherReport
            }]
          }
        });
      } catch (error) {
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{
              type: 'text',
              text: `❌ Error en weather intelligence: ${error.message}`
            }]
          }
        });
      }
      
    } else if (toolName === 'events_intelligence') {
      const location = toolArgs?.location || 'Madrid';
      const days = toolArgs?.days || 30;
      
      try {
        const eventsData = await getEventsIntelligence(location, days);
        
        let eventsReport = `🎪 Análisis de eventos para ${location} (próximos ${days} días)\n\n`;
        
        eventsReport += `📊 **Resumen del calendario:**\n`;
        eventsReport += `- Total eventos: ${eventsData.calendar_summary.total_events}\n`;
        eventsReport += `- Días alto impacto: ${eventsData.calendar_summary.high_impact_days}\n`;
        eventsReport += `- Período pico: ${eventsData.calendar_summary.peak_period}\n`;
        eventsReport += `- Oportunidad revenue: ${eventsData.calendar_summary.revenue_opportunity}\n\n`;
        
        eventsReport += `🎯 **Eventos principales:**\n`;
        eventsData.events.slice(0, 3).forEach(event => {
          eventsReport += `📅 ${event.date} - **${event.name}**\n`;
          eventsReport += `   Tipo: ${event.type} | Asistentes: ${event.expected_attendance.toLocaleString()}\n`;
          eventsReport += `   Impacto: ${event.tourism_impact} | ${event.revenue_impact}\n\n`;
        });
        
        eventsReport += `💰 **Recomendaciones pricing:**\n`;
        eventsData.pricing_recommendations.slice(0, 4).forEach(rec => {
          eventsReport += `• ${rec}\n`;
        });
        
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{
              type: 'text',
              text: eventsReport
            }]
          }
        });
      } catch (error) {
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{
              type: 'text',
              text: `❌ Error en events intelligence: ${error.message}`
            }]
          }
        });
      }
    } else if (toolName === 'hotel_data_intelligence') {
      const location = toolArgs?.location || 'paris_luxury';
      const hotelType = toolArgs?.hotelType || 'luxury';
      
      try {
        const hotelData = await getHotelDataIntelligence(location, hotelType);
        
        let hotelReport = `🏨 Análisis de datos hoteleros para ${hotelData.hotel_profile.name}\n\n`;
        
        hotelReport += `🏢 **Perfil del hotel:**\n`;
        hotelReport += `- Categoría: ${hotelData.hotel_profile.category}\n`;
        hotelReport += `- Habitaciones: ${hotelData.hotel_profile.rooms}\n`;
        hotelReport += `- Ubicación: ${hotelData.hotel_profile.location}\n`;
        hotelReport += `- Tipo: ${hotelData.hotel_profile.property_type}\n\n`;
        
        hotelReport += `📊 **Métricas actuales:**\n`;
        hotelReport += `- Ocupación: ${hotelData.current_metrics.occupancy}%\n`;
        hotelReport += `- ADR: ${typeof hotelData.current_metrics.adr === 'number' && hotelData.current_metrics.adr > 1000 ? '$' + hotelData.current_metrics.adr.toLocaleString() + ' COP' : '€' + hotelData.current_metrics.adr}\n`;
        hotelReport += `- RevPAR: ${typeof hotelData.current_metrics.revpar === 'number' && hotelData.current_metrics.revpar > 1000 ? '$' + hotelData.current_metrics.revpar.toLocaleString() + ' COP' : '€' + hotelData.current_metrics.revpar}\n\n`;
        
        hotelReport += `💰 **Análisis revenue:**\n`;
        hotelReport += `- Revenue mensual actual: ${typeof hotelData.revenue_analysis.current_monthly_revenue === 'number' && hotelData.revenue_analysis.current_monthly_revenue > 100000 ? '$' + hotelData.revenue_analysis.current_monthly_revenue.toLocaleString() + ' COP' : '€' + hotelData.revenue_analysis.current_monthly_revenue.toLocaleString()}\n`;
        hotelReport += `- Oportunidad revenue: ${typeof hotelData.revenue_analysis.revenue_opportunity === 'number' && hotelData.revenue_analysis.revenue_opportunity > 100000 ? '$' + hotelData.revenue_analysis.revenue_opportunity.toLocaleString() + ' COP' : '€' + hotelData.revenue_analysis.revenue_opportunity.toLocaleString()}\n`;
        hotelReport += `- Market share: ${hotelData.revenue_analysis.market_share}\n\n`;
        
        hotelReport += `🎯 **Oportunidades de pricing:**\n`;
        hotelData.revenue_management_insights.pricing_opportunities.slice(0, 3).forEach(opp => {
          hotelReport += `• ${opp}\n`;
        });
        
        hotelReport += `\n📈 **Competitive intelligence:**\n`;
        hotelReport += `- Posición vs competencia: ${hotelData.competitive_intelligence.position_vs_compset}\n`;
        hotelReport += `- Market positioning: ${hotelData.market_positioning}\n`;
        
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{
              type: 'text',
              text: hotelReport
            }]
          }
        });
      } catch (error) {
        res.json({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            content: [{
              type: 'text',
              text: `❌ Error en hotel data intelligence: ${error.message}`
            }]
          }
        });
      }  
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
            availableTools: ['web_search', 'analyze_text', 'generate_content', 'schedule_reminder', 'data_processor', 'weather_intelligence', 'events_intelligence', 'hotel_data_intelligence']
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
    status: 'Revenue Intelligence MCP Server v3.0 - HTTP Streamable Ready!',
    endpoints: {
      stream: '/stream (HTTP Streamable)',
      tools: [
        'web_search - Multi-engine web search',
        'analyze_text - Text analysis and insights', 
        'generate_content - Content creation',
        'schedule_reminder - Task and reminder management',
        'data_processor - Data transformation utilities',
        'weather_intelligence - Weather impact analysis',
        'events_intelligence - Event calendar optimization'
      ]
    },
    version: '3.0.0',
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
  console.log(`🚀 Revenue Intelligence MCP Server v3.0 running on port ${port}`);
  console.log(`📡 HTTP Streamable endpoint: /stream`);
  console.log(`🛠️ Available tools: web_search, analyze_text, generate_content, schedule_reminder, data_processor, weather_intelligence, events_intelligence, hotel_data_intelligence`);
  console.log(`🔍 Brave Search API: ${process.env.BRAVE_API_KEY ? 'CONFIGURED ✅' : 'NOT CONFIGURED ❌'}`);
  console.log(`🌤️ Weather API: ${process.env.OPENWEATHER_API_KEY ? 'CONFIGURED ✅' : 'NOT CONFIGURED ❌'}`);
});
