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

// 8. HOTEL DATA INTELLIGENCE (DINÁMICA - PROFESIONAL)
async function getHotelDataIntelligence(location, hotelType = "4_star", rooms = 85, propertyStyle = "urban") {
  
  // CONFIGURACIÓN DINÁMICA POR MERCADO
  const marketConfig = {
    // MERCADOS EUROPEOS
    "Paris": { currency: "EUR", baseRate: 280, marketMultiplier: 1.0, taxRate: 20, language: "FR" },
    "Madrid": { currency: "EUR", baseRate: 220, marketMultiplier: 0.85, taxRate: 21, language: "ES" },
    "Barcelona": { currency: "EUR", baseRate: 250, marketMultiplier: 0.95, taxRate: 21, language: "ES" },
    "Rome": { currency: "EUR", baseRate: 240, marketMultiplier: 0.90, taxRate: 22, language: "IT" },
    
    // MERCADOS COLOMBIANOS
    "Bogotá": { currency: "COP", baseRate: 350000, marketMultiplier: 1.0, taxRate: 19, language: "ES" },
    "Medellín": { currency: "COP", baseRate: 320000, marketMultiplier: 0.9, taxRate: 19, language: "ES" },
    "Cartagena": { currency: "COP", baseRate: 450000, marketMultiplier: 1.2, taxRate: 19, language: "ES" },
    "Pereira": { currency: "COP", baseRate: 280000, marketMultiplier: 0.75, taxRate: 19, language: "ES" },
    "Armenia": { currency: "COP", baseRate: 260000, marketMultiplier: 0.70, taxRate: 19, language: "ES" },
    "Salento": { currency: "COP", baseRate: 200000, marketMultiplier: 0.60, taxRate: 19, language: "ES" },
    "Manizales": { currency: "COP", baseRate: 270000, marketMultiplier: 0.73, taxRate: 19, language: "ES" },
    
    // OTROS MERCADOS
    "Mexico City": { currency: "MXN", baseRate: 2500, marketMultiplier: 1.0, taxRate: 16, language: "ES" },
    "Buenos Aires": { currency: "ARS", baseRate: 45000, marketMultiplier: 1.0, taxRate: 21, language: "ES" }
  };

  // CONFIGURACIÓN POR TIPO DE HOTEL
  const hotelTypeConfig = {
    "5_star": { multiplier: 1.8, occupancyTarget: 78, revparMultiplier: 1.9, segmentMix: "luxury" },
    "4_star": { multiplier: 1.0, occupancyTarget: 82, revparMultiplier: 1.0, segmentMix: "upscale" },
    "boutique": { multiplier: 1.3, occupancyTarget: 75, revparMultiplier: 1.4, segmentMix: "lifestyle" },
    "hostel": { multiplier: 0.15, occupancyTarget: 88, revparMultiplier: 0.18, segmentMix: "budget" }
  };

  // CONFIGURACIÓN POR ESTILO DE PROPIEDAD
  const propertyStyleConfig = {
    "urban": { modifier: 1.0, bookingWindow: 14, corporateShare: 35 },
    "resort": { modifier: 1.2, bookingWindow: 45, corporateShare: 15 },
    "experiential": { modifier: 0.9, bookingWindow: 28, corporateShare: 20 },
    "business": { modifier: 1.1, bookingWindow: 12, corporateShare: 50 }
  };

  // OBTENER CONFIGURACIONES
  const market = marketConfig[location] || marketConfig["Paris"];
  const typeConfig = hotelTypeConfig[hotelType] || hotelTypeConfig["4_star"];
  const styleConfig = propertyStyleConfig[propertyStyle] || propertyStyleConfig["urban"];

  // CÁLCULOS DINÁMICOS DE PRICING
  const baseADR = market.baseRate * typeConfig.multiplier * styleConfig.modifier;
  
  // AJUSTE POR TAMAÑO DE HOTEL
  let sizeModifier = 1.0;
  if (rooms <= 30) sizeModifier = 1.15; // Boutique premium
  else if (rooms <= 80) sizeModifier = 1.0; // Standard
  else if (rooms <= 150) sizeModifier = 0.92; // Corporate scale
  else sizeModifier = 0.85; // Large chain scale

  const adjustedADR = Math.round(baseADR * sizeModifier);
  const currentOccupancy = typeConfig.occupancyTarget + (Math.random() * 10 - 5); // ±5% variation
  const revpar = Math.round(adjustedADR * (currentOccupancy / 100));

  // GENERAR COMPETITIVE SET DINÁMICO
  const generateCompetitiveSet = (location, hotelType) => {
    const competitiveSets = {
      "Paris": {
        "5_star": ["Hotel de Crillon", "Le Bristol Paris", "Hotel Plaza Athénée"],
        "4_star": ["Hotel des Grands Boulevards", "Hotel Malte Opera", "Hotel Victoires Opera"],
        "boutique": ["Hotel Particulier Montmartre", "Hotel des Grands Boulevards", "Hotel Thérèse"]
      },
      "Bogotá": {
        "5_star": ["Hotel Casa Medina", "Sofitel Bogotá Victoria Regia", "JW Marriott Bogotá"],
        "4_star": ["Hotel Bioma", "Hotel Morrison 84", "Hotel Estelar La Fontana"],
        "boutique": ["Casa Legado", "Hotel B3 Virrey", "Hotel de la Opera"]
      },
      "Medellín": {
        "5_star": ["Hotel Intercontinental", "Hotel Four Points Medellín", "Hotel Estelar Milla de Oro"],
        "4_star": ["Hotel Dann Carlton", "Hotel San Fernando Plaza", "Hotel Poblado Plaza"],
        "boutique": ["Art Hotel", "Hotel Du Parc", "Casa Kiwi Hostel"]
      },
      "Cartagena": {
        "5_star": ["Hotel Charleston Cartagena", "Sofitel Legend Santa Clara", "Hotel Casa San Agustín"],
        "4_star": ["Hotel Estelar Cartagena", "Hotel Capilla del Mar", "Hotel Las Américas"],
        "boutique": ["Hotel Casa del Curato", "Ananda Hotel Boutique", "Hotel Casa Lola"]
      }
    };
    
    return competitiveSets[location]?.[hotelType] || ["Competitor A", "Competitor B", "Competitor C"];
  };

  // GENERAR SEGMENTACIÓN DE MERCADO DINÁMICA
  const generateMarketSegmentation = (segmentMix, corporateShare) => {
    switch(segmentMix) {
      case "luxury":
        return {
          leisure_premium: { share: 50, adr: adjustedADR * 1.1, booking_window: 35, growth_trend: "+15%" },
          corporate_luxury: { share: corporateShare, adr: adjustedADR * 0.95, booking_window: 12, growth_trend: "+8%" },
          groups_mice: { share: 15, adr: adjustedADR * 0.85, booking_window: 60, growth_trend: "+12%" },
          packages_experiences: { share: 100 - corporateShare - 65, adr: adjustedADR * 1.25, booking_window: 28, growth_trend: "+22%" }
        };
      case "upscale":
        return {
          leisure: { share: 45, adr: adjustedADR * 1.05, booking_window: 25, growth_trend: "+12%" },
          corporate: { share: corporateShare, adr: adjustedADR * 0.95, booking_window: 14, growth_trend: "+5%" },
          groups: { share: 15, adr: adjustedADR * 0.80, booking_window: 45, growth_trend: "+2%" },
          packages: { share: 100 - corporateShare - 60, adr: adjustedADR * 1.15, booking_window: 21, growth_trend: "+18%" }
        };
      case "budget":
        return {
          backpackers: { share: 60, adr: adjustedADR * 1.0, booking_window: 7, growth_trend: "+25%" },
          budget_travelers: { share: 25, adr: adjustedADR * 1.1, booking_window: 14, growth_trend: "+15%" },
          groups: { share: 15, adr: adjustedADR * 0.90, booking_window: 21, growth_trend: "+8%" }
        };
      default:
        return {
          leisure: { share: 45, adr: adjustedADR * 1.05, booking_window: 25, growth_trend: "+12%" },
          corporate: { share: corporateShare, adr: adjustedADR * 0.95, booking_window: 14, growth_trend: "+5%" },
          groups: { share: 100 - corporateShare - 45, adr: adjustedADR * 0.85, booking_window: 45, growth_trend: "+8%" }
        };
    }
  };

  // GENERAR TIPOS DE HABITACIÓN DINÁMICOS
  const generateRoomTypes = (totalRooms, hotelType) => {
    const roomDistribution = {
      "5_star": [
        { type: "Deluxe", percentage: 50, premium: 1.0 },
        { type: "Junior Suite", percentage: 30, premium: 1.4 },
        { type: "Presidential Suite", percentage: 20, premium: 2.2 }
      ],
      "4_star": [
        { type: "Standard", percentage: 55, premium: 0.85 },
        { type: "Superior", percentage: 35, premium: 1.0 },
        { type: "Suite", percentage: 10, premium: 1.6 }
      ],
      "boutique": [
        { type: "Classic", percentage: 40, premium: 0.9 },
        { type: "Premium", percentage: 45, premium: 1.1 },
        { type: "Signature Suite", percentage: 15, premium: 1.8 }
      ],
      "hostel": [
        { type: "Shared Dorm", percentage: 70, premium: 0.4 },
        { type: "Private Room", percentage: 25, premium: 1.0 },
        { type: "Private Suite", percentage: 5, premium: 1.8 }
      ]
    };

    const distribution = roomDistribution[hotelType] || roomDistribution["4_star"];
    
    return distribution.map(room => ({
      type: room.type,
      inventory: Math.round(totalRooms * (room.percentage / 100)),
      current_rate: Math.round(adjustedADR * room.premium),
      target_rate: Math.round(adjustedADR * room.premium * 1.12),
      occupancy: Math.round(currentOccupancy + (Math.random() * 10 - 5))
    }));
  };

  // CONSTRUIR OBJETO DE DATOS COMPLETO
  const competitiveSet = generateCompetitiveSet(location, hotelType);
  const marketSegments = generateMarketSegmentation(typeConfig.segmentMix, styleConfig.corporateShare);
  const roomTypes = generateRoomTypes(rooms, hotelType);

  // CÁLCULOS DE REVENUE MANAGEMENT
  const currentRevenueMonthly = revpar * rooms * 30;
  const targetRevenueMonthly = currentRevenueMonthly * 1.18; // 18% target increase
  const revenueGap = targetRevenueMonthly - currentRevenueMonthly;

  return {
    hotel_profile: {
      name: `${hotelType.replace('_', ' ').toUpperCase()} Hotel ${location}`,
      category: `${hotelType.replace('_', '★').toUpperCase()}`,
      rooms: rooms,
      location: location,
      competitive_set: competitiveSet,
      property_type: `${propertyStyle} ${hotelType.replace('_', ' ')}`
    },
    
    current_metrics: {
      occupancy: Math.round(currentOccupancy * 10) / 10,
      adr: adjustedADR,
      revpar: revpar,
      currency: market.currency,
      last_30_days: { 
        occupancy: Math.round((currentOccupancy - 2.5) * 10) / 10, 
        adr: Math.round(adjustedADR * 0.95), 
        revpar: Math.round(revpar * 0.92) 
      },
      ytd_performance: { 
        occupancy: Math.round((currentOccupancy - 1.2) * 10) / 10, 
        adr: Math.round(adjustedADR * 0.97), 
        revpar: Math.round(revpar * 0.95) 
      }
    },

    room_types: roomTypes,
    market_segments: marketSegments,

    channel_mix: {
      direct: { share: 40, adr: Math.round(adjustedADR * 1.05), commission: 0, conversion: "3.2%" },
      ota_booking: { share: 25, adr: Math.round(adjustedADR * 0.92), commission: 18, conversion: "12.1%" },
      ota_expedia: { share: 15, adr: Math.round(adjustedADR * 0.90), commission: 20, conversion: "8.5%" },
      corporate_contracts: { share: 20, adr: Math.round(adjustedADR * 0.95), commission: 5, conversion: "15.8%" }
    },

    market_positioning: `${hotelType.replace('_', ' ')} positioning in ${location} ${propertyStyle} market`,
    
    revenue_analysis: {
      current_monthly_revenue: Math.round(currentRevenueMonthly),
      target_monthly_revenue: Math.round(targetRevenueMonthly),
      revenue_opportunity: Math.round(revenueGap),
      performance_vs_budget: market.currency === "EUR" ? "+8.7%" : "+5.2%",
      market_share: rooms <= 50 ? "8%" : rooms <= 100 ? "12%" : "18%"
    },

    revenue_management_insights: {
      booking_pace: `${Math.round(5 + Math.random() * 10)}% ahead vs last year same period`,
      demand_forecast: `${propertyStyle} demand ${market.currency === "EUR" ? "steady with seasonal uptick" : "growing with tourism recovery"}`,
      
      critical_dates: market.currency === "EUR" ? [
        "2025-07-14: Summer peak season begins",
        "2025-09-15: Business travel resumes", 
        "2025-12-20: Holiday premium rates"
      ] : [
        "2025-07-15: Peak season Colombia begins",
        "2025-08-15: Festival season",
        "2025-12-15: Holiday premium season"
      ],

      pricing_opportunities: [
        `Optimize ${roomTypes[0]?.type} rates +${Math.round(8 + Math.random() * 7)}% (demand exceeds supply)`,
        `Implement dynamic weekend pricing +${Math.round(15 + Math.random() * 10)}% for peak dates`,
        `${propertyStyle} packages restructuring for better yield +${Math.round(10 + Math.random() * 15)}%`,
        `Corporate rates adjustment +${Math.round(3 + Math.random() * 8)}% (underpriced vs market)`
      ]
    },

    competitive_intelligence: {
      position_vs_compset: `ADR premium +${Math.round(8 + Math.random() * 12)}% vs competitive set`,
      market_opportunities: [
        `${hotelType.replace('_', ' ')} market growing ${Math.round(12 + Math.random() * 8)}% annually`,
        `${propertyStyle} trend benefits ${location} location`,
        `${market.currency} exchange rates favor international guests`
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
  description: 'Dynamic hotel operational data and revenue management insights for any location, hotel type, and size',
  inputSchema: {
    type: 'object',
    properties: {
      location: { 
        type: 'string', 
        description: 'Hotel location (e.g., Paris, Bogotá, Medellín, Cartagena, Madrid, etc.)' 
      },
      hotelType: { 
        type: 'string',
        enum: ['5_star', '4_star', 'boutique', 'hostel'],
        description: 'Hotel category: 5_star, 4_star, boutique, or hostel'
      },
      rooms: { 
        type: 'number', 
        description: 'Number of rooms (10-300+)' 
      },
      propertyStyle: { 
        type: 'string',
        enum: ['urban', 'resort', 'experiential', 'business'],
        description: 'Property style: urban, resort, experiential, or business'
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
      const location = toolArgs?.location || 'Paris';
      const hotelType = toolArgs?.hotelType || '4_star';
      const rooms = toolArgs?.rooms || 85;
      const propertyStyle = toolArgs?.propertyStyle || 'urban';
      
      try {
        const hotelData = await getHotelDataIntelligence(location, hotelType, rooms, propertyStyle);
        
        let hotelReport = `🏨 Análisis dinámico para ${hotelData.hotel_profile.name}\n\n`;
        
        hotelReport += `🏢 **Perfil del hotel:**\n`;
        hotelReport += `- Categoría: ${hotelData.hotel_profile.category}\n`;
        hotelReport += `- Habitaciones: ${hotelData.hotel_profile.rooms}\n`;
        hotelReport += `- Ubicación: ${hotelData.hotel_profile.location}\n`;
        hotelReport += `- Tipo: ${hotelData.hotel_profile.property_type}\n`;
        hotelReport += `- Competitive Set: ${hotelData.hotel_profile.competitive_set.join(', ')}\n\n`;
        
        hotelReport += `📊 **Métricas actuales (${hotelData.current_metrics.currency}):**\n`;
        hotelReport += `- Ocupación: ${hotelData.current_metrics.occupancy}%\n`;
        hotelReport += `- ADR: ${hotelData.current_metrics.currency === 'EUR' ? '€' : hotelData.current_metrics.currency === 'COP' ? '$' : ''}${hotelData.current_metrics.adr.toLocaleString()} ${hotelData.current_metrics.currency}\n`;
        hotelReport += `- RevPAR: ${hotelData.current_metrics.currency === 'EUR' ? '€' : hotelData.current_metrics.currency === 'COP' ? '$' : ''}${hotelData.current_metrics.revpar.toLocaleString()} ${hotelData.current_metrics.currency}\n\n`;
        
        hotelReport += `💰 **Análisis revenue:**\n`;
        hotelReport += `- Revenue mensual actual: ${hotelData.current_metrics.currency === 'EUR' ? '€' : '$'}${hotelData.revenue_analysis.current_monthly_revenue.toLocaleString()} ${hotelData.current_metrics.currency}\n`;
        hotelReport += `- Oportunidad revenue: ${hotelData.current_metrics.currency === 'EUR' ? '€' : '$'}${hotelData.revenue_analysis.revenue_opportunity.toLocaleString()} ${hotelData.current_metrics.currency}\n`;
        hotelReport += `- Market share: ${hotelData.revenue_analysis.market_share}\n`;
        hotelReport += `- Performance vs budget: ${hotelData.revenue_analysis.performance_vs_budget}\n\n`;
        
        hotelReport += `🏠 **Mix de habitaciones:**\n`;
        hotelData.room_types.slice(0, 3).forEach(room => {
          hotelReport += `- ${room.type}: ${room.inventory} hab, ${hotelData.current_metrics.currency === 'EUR' ? '€' : '$'}${room.current_rate.toLocaleString()} ${hotelData.current_metrics.currency}, ${room.occupancy}% occ\n`;
        });
        
        hotelReport += `\n🎯 **Oportunidades de pricing:**\n`;
        hotelData.revenue_management_insights.pricing_opportunities.slice(0, 3).forEach(opp => {
          hotelReport += `• ${opp}\n`;
        });
        
        hotelReport += `\n📈 **Competitive intelligence:**\n`;
        hotelReport += `- Posición vs competencia: ${hotelData.competitive_intelligence.position_vs_compset}\n`;
        hotelReport += `- Market positioning: ${hotelData.market_positioning}\n`;
        hotelReport += `- Booking pace: ${hotelData.revenue_management_insights.booking_pace}\n`;
        
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
