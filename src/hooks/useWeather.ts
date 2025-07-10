import { useState, useEffect, useCallback } from 'react';
import { weatherService } from '../services/weatherService';
import { WeatherData, HourlyForecast, DailyForecast, CitySearchResult } from '../types/weather';

interface UseWeatherReturn {
  currentWeather: WeatherData | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  loading: boolean;
  error: string | null;
  searchResults: CitySearchResult[];
  searchLoading: boolean;
  fetchWeatherByCity: (cityName: string) => Promise<void>;
  fetchWeatherByCoordinates: (lat: number, lon: number) => Promise<void>;
  fetchCurrentLocationWeather: () => Promise<void>;
  searchCities: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useWeather = (): UseWeatherReturn => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchWeatherByCity = useCallback(async (cityName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const weather = await weatherService.getCurrentWeatherByCity(cityName);
      setCurrentWeather(weather);
      
      // Fetch forecast data
      const forecast = await weatherService.getForecast(
        weather.coordinates.lat,
        weather.coordinates.lon
      );
      setHourlyForecast(forecast.hourly);
      setDailyForecast(forecast.daily);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCoordinates = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const weather = await weatherService.getCurrentWeather(lat, lon);
      setCurrentWeather(weather);
      
      // Fetch forecast data
      const forecast = await weatherService.getForecast(lat, lon);
      setHourlyForecast(forecast.hourly);
      setDailyForecast(forecast.daily);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentLocationWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const weather = await weatherService.getCurrentLocationWeather();
      setCurrentWeather(weather);
      
      // Fetch forecast data
      const forecast = await weatherService.getForecast(
        weather.coordinates.lat,
        weather.coordinates.lon
      );
      setHourlyForecast(forecast.hourly);
      setDailyForecast(forecast.daily);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch location weather');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCities = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    try {
      const results = await weatherService.searchCities(query);
      setSearchResults(results);
    } catch (err) {
      console.error('City search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Load default location weather on mount
  useEffect(() => {
    fetchCurrentLocationWeather().catch(() => {
      // If geolocation fails, load weather for a default city
      fetchWeatherByCity('New York');
    });
  }, [fetchCurrentLocationWeather, fetchWeatherByCity]);

  return {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    loading,
    error,
    searchResults,
    searchLoading,
    fetchWeatherByCity,
    fetchWeatherByCoordinates,
    fetchCurrentLocationWeather,
    searchCities,
    clearError
  };
};