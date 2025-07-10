import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  TrendingUp,
  Sunrise,
  Sunset,
  Navigation,
  Loader2,
  AlertCircle,
  RefreshCw,
  Locate,
  Star,
  Activity,
  Compass
} from 'lucide-react';
import { useWeather } from '../hooks/useWeather';

const WeatherApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    loading,
    error,
    searchResults,
    searchLoading,
    fetchWeatherByCity,
    fetchCurrentLocationWeather,
    searchCities,
    clearError
  } = useWeather();

  const getWeatherIcon = (iconType: string, size: number = 24) => {
    const iconProps = { size, className: 'text-white drop-shadow-lg' };
    switch (iconType) {
      case 'sun': return <Sun {...iconProps} />;
      case 'cloud': return <Cloud {...iconProps} />;
      case 'rain': return <CloudRain {...iconProps} />;
      case 'snow': return <CloudSnow {...iconProps} />;
      case 'storm': return <Zap {...iconProps} />;
      default: return <Sun {...iconProps} />;
    }
  };

  const scrollHourly = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentHour > 0) {
      setCurrentHour(currentHour - 1);
    } else if (direction === 'right' && currentHour < hourlyForecast.length - 8) {
      setCurrentHour(currentHour + 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchCities(value);
    }, 300);
  };

  const handleSuggestionClick = async (city: typeof searchResults[0]) => {
    setSearchQuery(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
    await fetchWeatherByCity(city.name);
  };

  const handleCurrentLocation = async () => {
    await fetchCurrentLocationWeather();
  };

  const handleRefresh = async () => {
    if (currentWeather) {
      await fetchWeatherByCity(currentWeather.location);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (loading && !currentWeather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="text-center z-10">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-spin">
              <Sun className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-ping"></div>
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            WeatherLux
          </h2>
          <p className="text-xl text-slate-300 mb-2">Loading weather data...</p>
          <div className="flex items-center justify-center space-x-2 text-slate-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Fetching real-time conditions</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/10 to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-indigo-400/30 rounded-full animate-bounce delay-1000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header */}
          <header className="mb-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl">
                    <Sun className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Weather-Man Amrit
                  </h1>
                  <p className="text-slate-300 flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>Premium weather experience</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCurrentLocation}
                  disabled={loading}
                  className="group relative p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 backdrop-blur-md border border-white/20"
                  title="Use current location"
                >
                  <Locate className="w-6 h-6 group-hover:text-blue-300 transition-colors" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                </button>
                
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="group relative p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 backdrop-blur-md border border-white/20"
                  title="Refresh weather data"
                >
                  <RefreshCw className={`w-6 h-6 group-hover:text-green-300 transition-colors ${loading ? 'animate-spin' : ''}`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                </button>
                
                <div className="text-right bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center space-x-2 text-slate-300 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Live Updates</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-3xl p-6 mb-8 backdrop-blur-md">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-red-500/20 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-200 mb-1">Weather Service Error</h3>
                    <p className="text-red-300">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

  
            <div ref={searchRef} className="relative max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
                  <div className="flex items-center">
                    <div className="pl-6 pr-4 py-6">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <input
                      type="text"
                      placeholder="Discover weather in any city worldwide..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                      className="flex-1 py-6 pr-6 bg-transparent text-white text-lg placeholder-slate-400 focus:outline-none"
                    />
                    <div className="pr-6">
                      {searchLoading ? (
                        <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                      ) : (
                        <Compass className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Suggestions Dropdown */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden z-50 shadow-2xl">
                  {searchResults.map((city, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(city)}
                      className="flex items-center justify-between p-6 hover:bg-white/10 cursor-pointer transition-all duration-300 border-b border-white/10 last:border-b-0 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                          <MapPin className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{city.name}</div>
                          <div className="text-slate-400">
                            {city.state ? `${city.state}, ` : ''}{city.country}
                          </div>
                        </div>
                      </div>
                      <Navigation className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>

          {currentWeather && (
            <>
              {/* Premium Main Weather Card */}
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <MapPin className="w-7 h-7 text-blue-300" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">{currentWeather.location}</h2>
                        <p className="text-slate-300">{currentWeather.country}</p>
                      </div>
                    </div>
                    <div className="text-right bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 text-slate-300 mb-2">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date().getFullYear()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Enhanced Temperature Display */}
                    <div className="xl:col-span-1">
                      <div className="text-center xl:text-left">
                        <div className="flex items-center justify-center xl:justify-start space-x-8 mb-8">
                          <div className="text-9xl font-thin tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
                            {currentWeather.temperature}°
                          </div>
                          <div className="text-center">
                            <div className="mb-4 relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-xl"></div>
                              <div className="relative">
                                {getWeatherIcon(currentWeather.icon, 96)}
                              </div>
                            </div>
                            <div className="text-2xl font-semibold mb-2">{currentWeather.condition}</div>
                            <div className="text-slate-400 capitalize">{currentWeather.description}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="text-2xl text-slate-200">
                            Feels like {currentWeather.feelsLike}°
                          </div>
                          <div className="flex items-center justify-center xl:justify-start space-x-6 text-slate-300">
                            <div className="flex items-center space-x-2 bg-orange-500/20 rounded-xl px-4 py-2">
                              <Sunrise className="w-5 h-5 text-orange-300" />
                              <span className="font-medium">{currentWeather.sunrise}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-purple-500/20 rounded-xl px-4 py-2">
                              <Sunset className="w-5 h-5 text-purple-300" />
                              <span className="font-medium">{currentWeather.sunset}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Premium Weather Details Grid */}
                    <div className="xl:col-span-2">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="group relative bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-3xl p-6 backdrop-blur-sm border border-blue-400/30 hover:scale-105 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-blue-400/30 rounded-2xl">
                                <Droplets className="w-6 h-6 text-blue-200" />
                              </div>
                              <span className="text-blue-200 font-semibold">Humidity</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">{currentWeather.humidity}%</div>
                            <div className="text-sm text-blue-300 bg-blue-500/20 rounded-full px-3 py-1 inline-block">
                              {currentWeather.humidity > 70 ? 'High' : currentWeather.humidity > 30 ? 'Normal' : 'Low'}
                            </div>
                          </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-3xl p-6 backdrop-blur-sm border border-green-400/30 hover:scale-105 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-green-400/30 rounded-2xl">
                                <Wind className="w-6 h-6 text-green-200" />
                              </div>
                              <span className="text-green-200 font-semibold">Wind</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">{currentWeather.windSpeed} km/h</div>
                            <div className="text-sm text-green-300 bg-green-500/20 rounded-full px-3 py-1 inline-block">
                              {currentWeather.windDirection}
                            </div>
                          </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-3xl p-6 backdrop-blur-sm border border-purple-400/30 hover:scale-105 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-purple-400/30 rounded-2xl">
                                <Gauge className="w-6 h-6 text-purple-200" />
                              </div>
                              <span className="text-purple-200 font-semibold">Pressure</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">{currentWeather.pressure}</div>
                            <div className="text-sm text-purple-300 bg-purple-500/20 rounded-full px-3 py-1 inline-block">
                              inHg
                            </div>
                          </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 rounded-3xl p-6 backdrop-blur-sm border border-yellow-400/30 hover:scale-105 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-yellow-400/30 rounded-2xl">
                                <Eye className="w-6 h-6 text-yellow-200" />
                              </div>
                              <span className="text-yellow-200 font-semibold">Visibility</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">{currentWeather.visibility}</div>
                            <div className="text-sm text-yellow-300 bg-yellow-500/20 rounded-full px-3 py-1 inline-block">
                              km
                            </div>
                          </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-3xl p-6 backdrop-blur-sm border border-orange-400/30 hover:scale-105 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-orange-400/30 rounded-2xl">
                                <Thermometer className="w-6 h-6 text-orange-200" />
                              </div>
                              <span className="text-orange-200 font-semibold">Feels Like</span>
                            </div>
                            <div className="text-4xl font-bold mb-2">{currentWeather.feelsLike}°</div>
                            <div className="text-sm text-orange-300 bg-orange-500/20 rounded-full px-3 py-1 inline-block">
                              {currentWeather.feelsLike > currentWeather.temperature ? 'Warmer' : 'Cooler'}
                            </div>
                          </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 rounded-3xl p-6 backdrop-blur-sm border border-indigo-400/30 hover:scale-105 transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                          <div className="relative">
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="p-3 bg-indigo-400/30 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-indigo-200" />
                              </div>
                              <span className="text-indigo-200 font-semibold">Condition</span>
                            </div>
                            <div className="text-xl font-bold mb-2 capitalize">{currentWeather.description}</div>
                            <div className="text-sm text-indigo-300 bg-indigo-500/20 rounded-full px-3 py-1 inline-block">
                              {currentWeather.condition}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Hourly Forecast */}
              {hourlyForecast.length > 0 && (
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        24-Hour Forecast
                      </h3>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => scrollHourly('left')}
                          disabled={currentHour === 0}
                          className="group p-4 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 border border-white/20"
                        >
                          <ChevronLeft className="w-6 h-6 group-hover:text-blue-300 transition-colors" />
                        </button>
                        <button
                          onClick={() => scrollHourly('right')}
                          disabled={currentHour >= hourlyForecast.length - 8}
                          className="group p-4 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 border border-white/20"
                        >
                          <ChevronRight className="w-6 h-6 group-hover:text-blue-300 transition-colors" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
                      {hourlyForecast.slice(currentHour, currentHour + 8).map((hour, index) => (
                        <div key={index} className="group text-center bg-white/5 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-white/10">
                          <div className="text-slate-300 mb-4 font-semibold">{hour.time}</div>
                          <div className="flex justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                              {getWeatherIcon(hour.icon, 48)}
                            </div>
                          </div>
                          <div className="text-2xl font-bold mb-3">{hour.temperature}°</div>
                          <div className="text-sm text-blue-300 bg-blue-500/20 rounded-full px-3 py-2 font-medium">
                            {hour.precipitation}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Daily Forecast */}
              {dailyForecast.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      7-Day Forecast
                    </h3>
                    <div className="space-y-4">
                      {dailyForecast.map((day, index) => (
                        <div key={index} className="group flex items-center justify-between p-6 bg-white/5 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] border border-white/10">
                          <div className="flex items-center space-x-8 flex-1">
                            <div className="w-24 text-left">
                              <div className="font-bold text-xl">{day.day}</div>
                              <div className="text-slate-400">{day.date}</div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="relative p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                                <div className="relative">
                                  {getWeatherIcon(day.icon, 48)}
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold text-lg">{day.condition}</div>
                                <div className="text-slate-400 capitalize">{day.description}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-8">
                            <div className="text-center">
                              <div className="text-slate-400 mb-2 text-sm">Rain</div>
                              <div className="bg-blue-500/20 rounded-full px-4 py-2 text-sm font-semibold border border-blue-400/30">
                                {day.precipitation}%
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 w-28 justify-end">
                              <span className="text-white font-bold text-2xl">{day.high}°</span>
                              <span className="text-slate-400 text-xl">{day.low}°</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Premium Footer */}
          <footer className="text-center mt-16 text-slate-300">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <p className="text-lg font-semibold">WeatherMan Amrit</p>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-slate-400 mb-2">
                 Real-time global weather data
              </p>
              <p className="text-sm text-slate-500">
                Accurate forecasts for various cities worldwide • Updated every minute
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;