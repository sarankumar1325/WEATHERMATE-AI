import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
import { SearchBar } from './components/SearchBar'
import { WeatherDisplay } from './components/WeatherDisplay'
import { BriefingPanel } from './components/BriefingPanel'
import { TimelineMap } from './components/TimelineMap'
import { fetchWeather, generateBriefing } from './services/weatherService'
import type { WeatherData, WeatherBriefing } from './types/weather'

const queryClient = new QueryClient()

function WeatherApp() {
  const [city, setCity] = useState<string>('')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { data: weather, isLoading: weatherLoading } = useQuery<WeatherData>({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(city),
    enabled: !!city,
    retry: false,
    onError: () => {
      toast.error('Failed to fetch weather data. Please try again.')
    }
  })

  const { data: briefing, isLoading: briefingLoading } = useQuery<WeatherBriefing>({
    queryKey: ['briefing', weather?.name],
    queryFn: () => generateBriefing(weather!.name, weather!),
    enabled: !!weather,
    retry: false,
    onError: () => {
      toast.error('Failed to generate weather briefing. Please try again.')
    }
  })

  const handleSearch = (query: string) => {
    setCity(query)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at ${scrollY % 100}% ${(scrollY % 100)}%, rgba(56, 189, 248, 0.1) 0%, transparent 60%)`
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-xl animate-float"
              style={{
                width: Math.random() * 200 + 100 + 'px',
                height: Math.random() * 200 + 100 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                transform: `translateY(${scrollY * 0.1 * (i % 2 ? 1 : -1)}px)`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <div 
          className="relative min-h-screen flex items-center justify-center py-20"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-16 transform transition-all duration-700 hover:scale-105">
              <div className="inline-block mb-6 animate-bounce-slow">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full p-1 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                    <svg className="w-14 h-14 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-6 transform hover:scale-105 transition-transform duration-300">
                WeatherMate
              </h1>
              <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Your intelligent weather companion powered by AI
              </p>
            </header>

            <div className="max-w-2xl mx-auto mb-16 transform hover:scale-105 transition-all duration-300">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {weatherLoading && (
              <div className="flex items-center justify-center p-12">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-blue-300 border-t-transparent rounded-full animate-spin-slow"></div>
                </div>
              </div>
            )}

            {weather && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                <div className="space-y-8 transform hover:translate-y-[-4px] transition-all duration-300">
                  <WeatherDisplay weather={weather} />
                  {briefingLoading ? (
                    <div className="card p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ) : (
                    briefing && <BriefingPanel briefing={briefing} />
                  )}
                </div>
                <div className="transform hover:translate-y-[-4px] transition-all duration-300">
                  <TimelineMap weather={weather} />
                </div>
              </div>
            )}

            {!weather && !weatherLoading && (
              <div className="max-w-3xl mx-auto">
                <div className="card p-12 text-center transform hover:scale-105 transition-all duration-300">
                  <div className="mb-8">
                    <svg className="w-20 h-20 mx-auto text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                    Ready to check the weather?
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Enter a city name above to get detailed weather information and AI-powered insights.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Real-time Updates', 'AI Insights', '3D Visualization'].map((feature, index) => (
                      <div key={index} className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-300">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">{feature}</h3>
                        <p className="text-blue-600 dark:text-blue-200">Experience weather like never before</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative bg-gradient-to-b from-transparent to-blue-100/50 dark:to-gray-900/50 py-12 mt-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Powered by OpenWeather API and Google's Gemini AI
            </p>
          </div>
        </footer>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          className: '!bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-white',
          duration: 3000,
          style: {
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  )
}
