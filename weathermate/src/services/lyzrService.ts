import axios from 'axios';
import type { WeatherData } from '../types/weather';

const LYZR_API_KEY = 'sk-default-9wdTatnu1figlN2UilBoBW0yz58wNokO';
const LYZR_API_SERVER = 'https://agent-prod.studio.lyzr.ai';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface LyzrEnvironment {
  id: string;
}

interface LyzrAgent {
  agent_id: string;
}

interface LyzrChatResponse {
  response: string;
}

class LyzrWeatherAgent {
  private environmentId: string | null = null;
  private agentId: string | null = null;

  private async createEnvironment(): Promise<string | null> {
    try {
      const response = await axios.post(
        `${LYZR_API_SERVER}/v2/environment`,
        {
          features: [
            { module: 'TOOL_CALLING', enabled: true },
            { module: 'OPEN_AI_RETRIEVAL_ASSISTANT', enabled: true },
            { module: 'SHORT_TERM_MEMORY', enabled: true },
            { module: 'LONG_TERM_MEMORY', enabled: true }
          ],
          llm_api_key: GEMINI_API_KEY
        },
        {
          headers: {
            'x-api-key': LYZR_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data as LyzrEnvironment;
      return data.id;
    } catch (error) {
      console.error('Error creating Lyzr environment:', error);
      return null;
    }
  }

  private async createAgent(envId: string): Promise<string | null> {
    try {
      const response = await axios.post(
        `${LYZR_API_SERVER}/v2/agent`,
        {
          name: 'WeatherAgent',
          system_prompt: `You are a helpful weather assistant that provides personalized recommendations based on weather conditions.
          Analyze the following weather parameters and provide specific advice:
          
          1. Temperature Analysis:
          - What to wear based on temperature and feels-like conditions
          - How to stay comfortable in the current temperature
          
          2. Weather Conditions:
          - Specific precautions based on current conditions (rain, clouds, sun, etc.)
          - Recommended activities suitable for these conditions
          
          3. Health & Safety:
          - Health precautions based on temperature, humidity, and conditions
          - UV protection needs if applicable
          - Air quality considerations
          
          4. Daily Planning:
          - Best times for outdoor activities
          - Indoor alternatives if needed
          - Travel recommendations
          
          5. Additional Tips:
          - Energy efficiency suggestions
          - Weather-specific life hacks
          
          Format your response in clear sections with emoji indicators.
          Keep recommendations practical, specific, and easy to follow.`,
          environment_id: envId
        },
        {
          headers: {
            'x-api-key': LYZR_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data as LyzrAgent;
      return data.agent_id;
    } catch (error) {
      console.error('Error creating Lyzr agent:', error);
      return null;
    }
  }

  private async createWeatherTool(weather: WeatherData) {
    try {
      const response = await axios.post(
        `${LYZR_API_SERVER}/v2/tool`,
        {
          schema: {
            openapi: '3.0.0',
            info: {
              title: 'Current Weather Data',
              version: '1.0'
            },
            paths: {
              '/current': {
                get: {
                  operationId: 'getCurrentWeather',
                  summary: 'Get current weather data',
                  responses: {
                    '200': {
                      description: 'Current weather data',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              location: { type: 'string' },
                              temperature: { type: 'number' },
                              feels_like: { type: 'number' },
                              humidity: { type: 'number' },
                              wind_speed: { type: 'number' },
                              conditions: { type: 'string' },
                              pressure: { type: 'number' }
                            }
                          },
                          example: {
                            location: weather.name,
                            temperature: weather.main.temp,
                            feels_like: weather.main.feels_like,
                            humidity: weather.main.humidity,
                            wind_speed: weather.wind.speed,
                            conditions: weather.weather[0].description,
                            pressure: weather.main.pressure
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          headers: {
            'x-api-key': LYZR_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.tool_ids;
    } catch (error) {
      console.error('Error creating weather tool:', error);
      return null;
    }
  }

  private async getGeminiRecommendations(weather: WeatherData): Promise<string> {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          contents: [{
            parts: [{
              text: `As a weather expert, provide detailed recommendations based on the following weather conditions in ${weather.name}:

Temperature: ${Math.round(weather.main.temp)}°C
Feels like: ${Math.round(weather.main.feels_like)}°C
Conditions: ${weather.weather[0].description}
Humidity: ${weather.main.humidity}%
Wind Speed: ${weather.wind.speed} m/s
Pressure: ${weather.main.pressure} hPa

Please provide specific recommendations for:
1. 👕 Clothing & Accessories
2. 🏃‍♂️ Outdoor Activities
3. 🏥 Health Precautions
4. 🚗 Travel Considerations
5. 💡 Energy Efficiency Tips

Format the response in clear sections with emojis and keep it concise but informative.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_API_KEY}`
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error getting Gemini recommendations:', error);
      throw error;
    }
  }

  public async getRecommendations(weather: WeatherData): Promise<string> {
    try {
      // First try with Lyzr
      if (!this.environmentId) {
        this.environmentId = await this.createEnvironment();
      }

      if (!this.environmentId) {
        throw new Error('Failed to create environment');
      }

      if (!this.agentId) {
        this.agentId = await this.createAgent(this.environmentId);
      }

      if (!this.agentId) {
        throw new Error('Failed to create agent');
      }

      await this.createWeatherTool(weather);

      const response = await axios.post(
        `${LYZR_API_SERVER}/v2/chat`,
        {
          user_id: 'weathermate_user',
          agent_id: this.agentId,
          session_id: `session_${weather.name}`,
          message: `Analyze the current weather in ${weather.name} and provide recommendations:
          Temperature: ${Math.round(weather.main.temp)}°C
          Feels like: ${Math.round(weather.main.feels_like)}°C
          Conditions: ${weather.weather[0].description}
          Humidity: ${weather.main.humidity}%
          Wind: ${weather.wind.speed} m/s`
        },
        {
          headers: {
            'x-api-key': LYZR_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data as LyzrChatResponse;
      return data.response;
    } catch (error) {
      console.error('Error with Lyzr API, falling back to Gemini:', error);
      try {
        // Fallback to direct Gemini API call
        return await this.getGeminiRecommendations(weather);
      } catch (geminiError) {
        console.error('Error with Gemini API fallback:', geminiError);
        return `Based on the current weather in ${weather.name} (${Math.round(weather.main.temp)}°C, ${weather.weather[0].description}):

👕 Clothing: Light and comfortable clothing suitable for ${Math.round(weather.main.temp)}°C

🏃‍♂️ Activities: Weather is suitable for outdoor activities, but monitor conditions

🏥 Health: Stay hydrated and use sun protection if needed

🚗 Travel: Normal travel conditions, no special precautions needed

💡 Tips: Regular ventilation recommended for comfort`;
      }
    }
  }
}

export const lyzrWeatherAgent = new LyzrWeatherAgent(); 