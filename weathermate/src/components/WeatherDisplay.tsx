import { useState, useEffect } from 'react';
import type { WeatherData } from '../types/weather';
import { lyzrWeatherAgent } from '../services/lyzrService';

interface WeatherDisplayProps {
  weather: WeatherData;
}

export const WeatherDisplay = ({ weather }: WeatherDisplayProps) => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const response = await lyzrWeatherAgent.getRecommendations(weather);
        setRecommendations(response);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [weather]);

  // Calculate additional weather metrics
  const windDirection = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  const getComfortLevel = (temp: number, humidity: number): string => {
    if (temp > 30) return 'Hot';
    if (temp < 10) return 'Cold';
    if (humidity > 70) return 'Humid';
    if (humidity < 30) return 'Dry';
    return 'Comfortable';
  };

  const getUVIndex = (temp: number, clouds: number): number => {
    const baseUV = Math.min(11, Math.max(1, Math.round((temp - 10) / 3)));
    return Math.max(1, Math.round(baseUV * (1 - clouds / 100)));
  };

  return (
    <div className="space-y-6">
      {/* Main Weather Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-[1.02]">
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{weather.name}</h2>
            <div className="flex items-center justify-center">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt={weather.weather[0].description}
                className="w-32 h-32 object-contain filter drop-shadow-lg"
              />
              <div className="ml-4 text-left">
                <p className="text-6xl font-bold text-gray-900 dark:text-white">
                  {Math.round(weather.main.temp)}°
                </p>
                <p className="text-xl text-gray-600 dark:text-gray-300 capitalize mt-1">
                  {weather.weather[0].description}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-6">
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400">Feels Like</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {Math.round(weather.main.feels_like)}°
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400">Humidity</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {weather.main.humidity}%
              </p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400">Wind</p>
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.round(weather.wind.speed)} m/s
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {windDirection(weather.wind.deg)}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400">Pressure</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {weather.main.pressure}
                <span className="text-base ml-1">hPa</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations and Additional Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Recommendations
            </h3>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {recommendations}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Weather Information */}
        <div className="space-y-6">
          {/* Comfort & UV Index */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Additional Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-300">Comfort Level</p>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  {getComfortLevel(weather.main.temp, weather.main.humidity)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-300">UV Index</p>
                <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                  {getUVIndex(weather.main.temp, 0)} of 11
                </p>
              </div>
            </div>
          </div>

          {/* Weather Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Today's Outlook</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <span className="text-green-700 dark:text-green-300">Morning</span>
                <span className="text-green-800 dark:text-green-200 font-semibold">
                  {Math.round(weather.main.temp - 2)}°C
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <span className="text-yellow-700 dark:text-yellow-300">Afternoon</span>
                <span className="text-yellow-800 dark:text-yellow-200 font-semibold">
                  {Math.round(weather.main.temp + 2)}°C
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <span className="text-blue-700 dark:text-blue-300">Evening</span>
                <span className="text-blue-800 dark:text-blue-200 font-semibold">
                  {Math.round(weather.main.temp - 1)}°C
                </span>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🌡️</span>
                <p className="text-gray-700 dark:text-gray-300">
                  Feels like {Math.round(weather.main.feels_like)}°C - {
                    weather.main.feels_like > weather.main.temp ? 'Humidity making it warmer' : 'Wind making it cooler'
                  }
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💨</span>
                <p className="text-gray-700 dark:text-gray-300">
                  Wind from {windDirection(weather.wind.deg)} at {Math.round(weather.wind.speed)} m/s
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💧</span>
                <p className="text-gray-700 dark:text-gray-300">
                  {weather.main.humidity}% humidity - {
                    weather.main.humidity > 70 ? 'High moisture levels' :
                    weather.main.humidity < 30 ? 'Very dry conditions' : 'Comfortable humidity'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 