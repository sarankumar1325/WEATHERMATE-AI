import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { WeatherData } from '../types/weather';

interface TimelineMapProps {
  weather: WeatherData;
}

export const TimelineMap = ({ weather }: TimelineMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Helper function to get activity recommendations based on weather
  const getActivityRecommendations = () => {
    const temp = weather.main.temp;
    const conditions = weather.weather[0].main.toLowerCase();
    const windSpeed = weather.wind.speed;

    const activities = {
      outdoor: [] as string[],
      indoor: [] as string[],
      sports: [] as string[]
    };

    // Outdoor activities
    if (temp > 15 && temp < 30 && !conditions.includes('rain')) {
      activities.outdoor.push('🚴 Cycling', '🏃‍♂️ Jogging', '🌳 Hiking', '📸 Photography');
    }
    if (temp > 20 && temp < 28 && !conditions.includes('rain')) {
      activities.outdoor.push('🧺 Picnicking', '🎨 Outdoor Painting');
    }
    if (windSpeed > 5) {
      activities.outdoor.push('🪁 Kite Flying', '🏄‍♂️ Windsurfing');
    }

    // Indoor activities
    if (conditions.includes('rain') || temp > 30 || temp < 10) {
      activities.indoor.push('📚 Reading', '🎨 Indoor Art', '🎮 Gaming', '🧩 Puzzles');
    }

    // Sports activities
    if (temp > 15 && temp < 28 && !conditions.includes('rain')) {
      activities.sports.push('⚽ Football', '🎾 Tennis', '🏸 Badminton');
    }
    if (temp > 25) {
      activities.sports.push('🏊‍♂️ Swimming');
    }

    return activities;
  };

  // Helper function to get weather summary
  const getWeatherSummary = () => {
    const temp = Math.round(weather.main.temp);
    const feelsLike = Math.round(weather.main.feels_like);
    const conditions = weather.weather[0].description;
    const windSpeed = weather.wind.speed;
    const humidity = weather.main.humidity;

    let comfort = "comfortable";
    if (temp > 30) comfort = "very hot";
    else if (temp > 25) comfort = "warm";
    else if (temp < 10) comfort = "cold";
    else if (temp < 15) comfort = "cool";

    let windDesc = "calm";
    if (windSpeed > 10) windDesc = "strong";
    else if (windSpeed > 5) windDesc = "moderate";

    return {
      temp,
      feelsLike,
      conditions,
      comfort,
      windDesc,
      humidity
    };
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [weather.coord.lon, weather.coord.lat],
      zoom: 9,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      })
    );

    // Add weather marker with custom element
    const markerElement = document.createElement('div');
    markerElement.className = 'flex items-center justify-center w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform duration-200';
    markerElement.innerHTML = `
      <img
        src="https://openweathermap.org/img/wn/${weather.weather[0].icon}.png"
        alt="${weather.weather[0].description}"
        class="w-8 h-8 object-contain"
      />
    `;

    new maplibregl.Marker({
      element: markerElement
    })
      .setLngLat([weather.coord.lon, weather.coord.lat])
      .addTo(map.current);

    // Add attribution control
    map.current.addControl(
      new maplibregl.AttributionControl({
        customAttribution: 'Weather data © OpenWeatherMap'
      })
    );

    return () => {
      map.current?.remove();
    };
  }, [weather.coord.lat, weather.coord.lon, weather.weather]);

  // Update map center when weather location changes
  useEffect(() => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: [weather.coord.lon, weather.coord.lat],
      zoom: 9,
      duration: 2000,
      essential: true
    });
  }, [weather.coord.lat, weather.coord.lon]);

  const activities = getActivityRecommendations();
  const summary = getWeatherSummary();

  return (
    <div className="space-y-8">
      {/* Map */}
      <div
        ref={mapContainer}
        className="w-full h-[400px] lg:h-[500px] rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-[1.02] bg-white dark:bg-gray-800"
      />

      {/* Weather Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-lg overflow-hidden text-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="w-16 h-16"
              />
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
              <h3 className="font-semibold text-lg mb-1">{weather.name}</h3>
              <p className="text-xs opacity-90">
                {weather.coord.lat.toFixed(2)}°N, {weather.coord.lon.toFixed(2)}°E
              </p>
            </div>
            <p className="text-4xl font-bold mb-2">{summary.temp}°C</p>
            <p className="text-base capitalize mb-2">{summary.conditions}</p>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span>High: {Math.round(weather.main.temp_max)}°C</span>
              <span>•</span>
              <span>Low: {Math.round(weather.main.temp_min)}°C</span>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-2">
              <span className="text-2xl">🌡️</span>
            </div>
            <p className="text-xl font-semibold">Feels like {summary.feelsLike}°C</p>
            <p className="text-sm opacity-90">Conditions feel {summary.comfort}</p>
          </div>

          <div className="text-center">
            <div className="mb-2">
              <span className="text-2xl">💨</span>
            </div>
            <p className="text-xl font-semibold">{summary.windDesc.charAt(0).toUpperCase() + summary.windDesc.slice(1)} Winds</p>
            <p className="text-sm opacity-90">{weather.wind.speed} m/s</p>
          </div>

          <div className="text-center">
            <div className="mb-2">
              <span className="text-2xl">💧</span>
            </div>
            <p className="text-xl font-semibold">{summary.humidity}% Humidity</p>
            <p className="text-sm opacity-90">
              {summary.humidity > 70 ? 'High moisture' : summary.humidity < 30 ? 'Very dry' : 'Comfortable'}
            </p>
          </div>
        </div>
      </div>

      {/* Activities Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-8 flex items-center">
            <svg className="w-7 h-7 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" />
            </svg>
            Recommended Activities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Outdoor Activities */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
                <span className="text-2xl mr-2">🌳</span>
                Outdoor Activities
              </h4>
              <ul className="space-y-3">
                {activities.outdoor.map((activity, index) => (
                  <li key={index} className="text-green-700 dark:text-green-200 flex items-center">
                    <span className="mr-2">•</span>
                    {activity}
                  </li>
                ))}
                {activities.outdoor.length === 0 && (
                  <li className="text-green-700 dark:text-green-200 italic">
                    Weather not suitable for outdoor activities
                  </li>
                )}
              </ul>
            </div>

            {/* Indoor Activities */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                <span className="text-2xl mr-2">🏠</span>
                Indoor Activities
              </h4>
              <ul className="space-y-3">
                {activities.indoor.map((activity, index) => (
                  <li key={index} className="text-purple-700 dark:text-purple-200 flex items-center">
                    <span className="mr-2">•</span>
                    {activity}
                  </li>
                ))}
                {activities.indoor.length === 0 && (
                  <li className="text-purple-700 dark:text-purple-200 italic">
                    Great weather for outdoor activities!
                  </li>
                )}
              </ul>
            </div>

            {/* Sports Activities */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                <span className="text-2xl mr-2">⚽</span>
                Sports Activities
              </h4>
              <ul className="space-y-3">
                {activities.sports.map((activity, index) => (
                  <li key={index} className="text-blue-700 dark:text-blue-200 flex items-center">
                    <span className="mr-2">•</span>
                    {activity}
                  </li>
                ))}
                {activities.sports.length === 0 && (
                  <li className="text-blue-700 dark:text-blue-200 italic">
                    Weather conditions not ideal for sports
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Weather Note */}
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <span className="font-semibold">Note:</span> These recommendations are based on the current weather conditions: {weather.weather[0].description}, {Math.round(weather.main.temp)}°C with {weather.wind.speed}m/s winds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 