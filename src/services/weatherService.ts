import { WeatherData, HourlyForecast, DailyForecast, CitySearchResult, WeatherApiResponse } from '../types/weather';

const API_KEY = import.meta.env.WEATHER_API_KEY;
const BASE_URL = import.meta.env.WEATHER_API_BASE_URL;
const GEOCODING_URL = import.meta.env.GEOCODING_API_BASE_URL;

// Debug environment variables
console.log('Environment check:');
console.log('API_KEY:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'MISSING');
console.log('BASE_URL:', BASE_URL);
console.log('GEOCODING_URL:', GEOCODING_URL);

class WeatherService {
  private async fetchWithErrorHandling(url: string): Promise<any> {
    console.log('Fetching URL:', url); // Debug log
    
    try {
      const response = await fetch(url);
      
      // Log response details for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Weather API Error: ${response.status} ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText);
        throw new Error('API returned non-JSON response. Please check your API key and endpoints.');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Weather API fetch error:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Invalid API response format. Please check your API configuration.');
      }
      throw error instanceof Error ? error : new Error('Unknown API error occurred');
    }
  }

  // Search cities for autocomplete
  async searchCities(query: string): Promise<CitySearchResult[]> {
    if (!query || query.length < 2) return [];
    
    if (!API_KEY) {
      console.error('API key is missing');
      return [];
    }
    
    const url = `${GEOCODING_URL}/direct?q=${encodeURIComponent(query)}&limit=8&appid=${API_KEY}`;
    
    try {
      const data = await this.fetchWithErrorHandling(url);
      return data.map((city: any) => ({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon
      }));
    } catch (error) {
      console.error('City search error:', error);
      return [];
    }
  }

  // Get current weather by coordinates
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    if (!API_KEY) {
      throw new Error('Weather API key is not configured. Please check your environment variables.');
    }
    
    const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    const data: WeatherApiResponse = await this.fetchWithErrorHandling(url);
    
    return this.transformCurrentWeatherData(data);
  }

  // Get current weather by city name
  async getCurrentWeatherByCity(cityName: string): Promise<WeatherData> {
    if (!API_KEY) {
      throw new Error('Weather API key is not configured. Please check your environment variables.');
    }
    
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
    
    const data: WeatherApiResponse = await this.fetchWithErrorHandling(url);
    
    return this.transformCurrentWeatherData(data);
  }

  // Get 5-day forecast (3-hour intervals)
  async getForecast(lat: number, lon: number): Promise<{ hourly: HourlyForecast[]; daily: DailyForecast[] }> {
    if (!API_KEY) {
      throw new Error('Weather API key is not configured. Please check your environment variables.');
    }
    
    const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    const data = await this.fetchWithErrorHandling(url);
    
    return {
      hourly: this.transformHourlyForecast(data.list.slice(0, 24)), // Next 24 hours (8 * 3-hour intervals)
      daily: this.transformDailyForecast(data.list)
    };
  }

  // Get user's current location weather
  async getCurrentLocationWeather(): Promise<WeatherData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const weather = await this.getCurrentWeather(
              position.coords.latitude,
              position.coords.longitude
            );
            resolve(weather);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error('Unable to retrieve your location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  private transformCurrentWeatherData(data: WeatherApiResponse): WeatherData {
    const windDirection = this.getWindDirection(data.wind.deg);
    
    return {
      location: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: this.mapWeatherIcon(data.weather[0].icon),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      windDirection,
      pressure: Math.round(data.main.pressure * 0.02953), // Convert hPa to inHg
      visibility: Math.round(data.visibility / 1000), // Convert m to km
      uvIndex: 0, // OpenWeatherMap doesn't provide UV in basic plan
      feelsLike: Math.round(data.main.feels_like),
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };
  }

  private transformHourlyForecast(forecastList: any[]): HourlyForecast[] {
    return forecastList.map((item, index) => ({
      time: index === 0 ? 'Now' : new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
        hour: 'numeric',
        hour12: true 
      }),
      temperature: Math.round(item.main.temp),
      icon: this.mapWeatherIcon(item.weather[0].icon),
      precipitation: Math.round((item.pop || 0) * 100),
      description: item.weather[0].description
    }));
  }

  private transformDailyForecast(forecastList: any[]): DailyForecast[] {
    const dailyData: { [key: string]: any[] } = {};
    
    // Group forecast data by day
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return Object.entries(dailyData).slice(0, 7).map(([date, items], index) => {
      const temps = items.map(item => item.main.temp);
      const high = Math.round(Math.max(...temps));
      const low = Math.round(Math.min(...temps));
      
      // Use the most common weather condition for the day
      const conditions = items.map(item => item.weather[0]);
      const mainCondition = conditions[Math.floor(conditions.length / 2)];
      
      // Calculate average precipitation chance
      const avgPrecipitation = Math.round(
        items.reduce((sum, item) => sum + (item.pop || 0), 0) / items.length * 100
      );

      return {
        day: index < days.length ? days[index] : new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        high,
        low,
        condition: mainCondition.main,
        icon: this.mapWeatherIcon(mainCondition.icon),
        precipitation: avgPrecipitation,
        description: mainCondition.description
      };
    });
  }

  private mapWeatherIcon(iconCode: string): string {
    const iconMap: { [key: string]: string } = {
      '01d': 'sun',      // clear sky day
      '01n': 'sun',      // clear sky night
      '02d': 'cloud',    // few clouds day
      '02n': 'cloud',    // few clouds night
      '03d': 'cloud',    // scattered clouds
      '03n': 'cloud',
      '04d': 'cloud',    // broken clouds
      '04n': 'cloud',
      '09d': 'rain',     // shower rain
      '09n': 'rain',
      '10d': 'rain',     // rain
      '10n': 'rain',
      '11d': 'storm',    // thunderstorm
      '11n': 'storm',
      '13d': 'snow',     // snow
      '13n': 'snow',
      '50d': 'cloud',    // mist
      '50n': 'cloud'
    };
    
    return iconMap[iconCode] || 'sun';
  }

  private getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}

export const weatherService = new WeatherService();