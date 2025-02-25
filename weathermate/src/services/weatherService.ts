import axios from 'axios';
import type { WeatherData, WeatherBriefing } from '../types/weather';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const fetchWeather = async (query: string): Promise<WeatherData> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
};

export const generateBriefing = async (city: string, weatherData: WeatherData): Promise<WeatherBriefing> => {
  try {
    const prompt = `Generate a friendly weather briefing for ${city}. Current conditions: ${weatherData.weather[0].description}, temperature: ${weatherData.main.temp}°C. Include tips for the day.`;
    
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`
        }
      }
    );

    // Process Gemini response and extract relevant information
    const briefingText = response.data.candidates[0].content.parts[0].text;
    const tips = getDailyTips(weatherData);

    return {
      text: briefingText,
      tips: [tips],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('Failed to generate weather briefing');
  }
};

const getDailyTips = (weather: WeatherData): string => {
  const temp = weather.main.temp;
  const conditions = weather.weather[0].main.toLowerCase();

  if (conditions.includes('rain')) {
    return "Don't forget your umbrella!";
  } else if (temp > 30) {
    return "It's very hot - stay hydrated and seek shade!";
  } else if (temp > 25) {
    return "Pleasant warm weather - great for outdoor activities!";
  } else if (temp < 10) {
    return "It's chilly - bundle up!";
  }
  return "Enjoy the weather!";
}; 