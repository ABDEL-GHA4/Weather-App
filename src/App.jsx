import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Sun, 
  Moon, 
  CloudRain, 
  Wind, 
  Search, 
  Thermometer, 
  Droplets, 
  CloudLightning, 
  CloudSnow, 
  Cloudy, 
  X, 
  CloudMoon, 
  CloudDrizzle, 
  MoonStar,
  CloudFog,
  CloudSun
} from 'lucide-react';

const API_KEY = '6aaac2f23f29bc1fc7fa91b5390fb312';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function App() {
  const [city, setCity] = useState('Rabat');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputError, setInputError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  const isDayTime = (hour) => {
    return hour >= 6 && hour < 18;
  };

  const getBackgroundImage = (condition, isDay) => {
    if (!isDay) {
      switch (condition.toLowerCase()) {
        case 'clear':
          return 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&q=80';
        case 'clouds':
          return 'https://images.unsplash.com/photo-1501418611786-e29f9929fe03?auto=format&fit=crop&q=80';
        case 'rain':
          return 'https://images.unsplash.com/photo-1438260483147-81148f799f25?auto=format&fit=crop&q=80';
        case 'thunderstorm':
          return 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80';
        case 'snow':
          return 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&q=80';
        default:
          return 'https://images.unsplash.com/photo-1532978379970-2260b0c57fc1?auto=format&fit=crop&q=80';
      }
    }

    switch (condition.toLowerCase()) {
      case 'clear':
        return 'https://images.unsplash.com/photo-1598717123623-994ab270a041?auto=format&fit=crop&q=80';
      case 'clouds':
        return 'https://images.unsplash.com/photo-1611928482473-7b27d24eab80?auto=format&fit=crop&q=80';
      case 'rain':
        return 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=80';
      case 'thunderstorm':
        return 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80';
      case 'snow':
        return 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&q=80';
      case 'mist':
      case 'fog':
        return 'https://images.unsplash.com/photo-1543968996-ee822b8176ba?auto=format&fit=crop&q=80';
      case 'drizzle':
        return 'https://images.unsplash.com/photo-1541919329513-35f7af297129?auto=format&fit=crop&q=80';
      default:
        return 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80';
    }
  };

  const validateCity = (cityName) => {
    if (!cityName.trim()) {
      setInputError('Please enter a city name');
      return false;
    }
    if (!/^[a-zA-Z\s-]+$/.test(cityName.trim())) {
      setInputError('City name should only contain letters, spaces, and hyphens');
      return false;
    }
    setInputError('');
    return true;
  };

  const fetchWeatherData = async (searchCity) => {
    try {
      setLoading(true);
      setError(null);
  
      // Validate the city name before making the API call
      if (!validateCity(searchCity)) {
        throw new Error('Invalid city name');
      }
  
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?q=${searchCity}&units=metric&appid=${API_KEY}`
      );
  
      // Check if the response is OK
      if (!weatherResponse.ok) {
        if (weatherResponse.status === 404) {
          throw new Error('City not found. Please check the spelling and try again.');
        }
        throw new Error('Failed to fetch weather data');
      }
  
      const weatherData = await weatherResponse.json();
      const currentHour = new Date().getHours();
  
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${searchCity}&units=metric&appid=${API_KEY}`
      );
  
      if (!forecastResponse.ok) {
        throw new Error('Failed to fetch forecast data');
      }
  
      const forecastData = await forecastResponse.json();
      const dailyForecasts = processForecastData(forecastData.list);
  
      setWeather({
        temp: Math.round(weatherData.main.temp),
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
        city: weatherData.name,
        isDay: isDayTime(currentHour)
      });
  
      setForecast(dailyForecasts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const processForecastData = (forecastList) => {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      
      if (!dailyData[day]) {
        dailyData[day] = {
          temp: Math.round(item.main.temp),
          condition: item.weather[0].main,
          description: item.weather[0].description,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6),
          hour,
          isDay: isDayTime(hour)
        };
      }
    });
    
    return Object.entries(dailyData).slice(0, 7);
  };

  const getWeatherIcon = (condition, isDay = true, size = "large") => {
    const iconSize = size === "large" ? "w-32 h-32" : "w-8 h-8";
    const iconStyles = size === "large" 
      ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-110" 
      : "";
    const conditionLower = condition.toLowerCase();
    
    if (!isDay) {
      switch (conditionLower) {
        case 'clear':
          return <MoonStar className={`${iconSize} ${iconStyles} text-blue-200`} strokeWidth={1.5} />;
        case 'clouds':
          if (conditionLower.includes('few') || conditionLower.includes('scattered')) {
            return <CloudMoon className={`${iconSize} ${iconStyles} text-blue-200`} strokeWidth={1.5} />;
          }
          return <Cloudy className={`${iconSize} ${iconStyles} text-gray-400`} strokeWidth={1.5} />;
        case 'rain':
          return <CloudRain className={`${iconSize} ${iconStyles} text-blue-300`} strokeWidth={1.5} />;
        case 'drizzle':
          return <CloudDrizzle className={`${iconSize} ${iconStyles} text-blue-300`} strokeWidth={1.5} />;
        case 'thunderstorm':
          return <CloudLightning className={`${iconSize} ${iconStyles} text-yellow-400`} strokeWidth={1.5} />;
        case 'snow':
          return <CloudSnow className={`${iconSize} ${iconStyles} text-blue-200`} strokeWidth={1.5} />;
        case 'mist':
        case 'fog':
          return <CloudFog className={`${iconSize} ${iconStyles} text-gray-400`} strokeWidth={1.5} />;
        default:
          return <Moon className={`${iconSize} ${iconStyles} text-blue-200`} strokeWidth={1.5} />;
      }
    }

    switch (conditionLower) {
      case 'clear':
        return <Sun className={`${iconSize} ${iconStyles} text-yellow-400`} strokeWidth={1.5} />;
      case 'clouds':
        if (conditionLower.includes('few') || conditionLower.includes('scattered')) {
          return <CloudSun className={`${iconSize} ${iconStyles} text-gray-400`} strokeWidth={1.5} />;
        }
        return <Cloudy className={`${iconSize} ${iconStyles} text-gray-400`} strokeWidth={1.5} />;
      case 'rain':
        return <CloudRain className={`${iconSize} ${iconStyles} text-blue-400`} strokeWidth={1.5} />;
      case 'drizzle':
        return <CloudDrizzle className={`${iconSize} ${iconStyles} text-blue-400`} strokeWidth={1.5} />;
      case 'thunderstorm':
        return <CloudLightning className={`${iconSize} ${iconStyles} text-yellow-400`} strokeWidth={1.5} />;
      case 'snow':
        return <CloudSnow className={`${iconSize} ${iconStyles} text-blue-200`} strokeWidth={1.5} />;
      case 'mist':
      case 'fog':
        return <CloudFog className={`${iconSize} ${iconStyles} text-gray-400`} strokeWidth={1.5} />;
      default:
        return <Cloud className={`${iconSize} ${iconStyles} text-gray-400`} strokeWidth={1.5} />;
    }
  };

  useEffect(() => {
    if (validateCity(city)) {
      fetchWeatherData(city);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (validateCity(city)) {
      fetchWeatherData(city);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.trim()) {
      validateCity(value);
    } else {
      setInputError('');
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center transition-all duration-1000"
      style={{
        backgroundImage: `linear-gradient(to bottom right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${weather ? getBackgroundImage(weather.condition, weather.isDay) : getBackgroundImage("clear", true)}')`
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="bg-black/30 backdrop-blur-lg rounded-full p-2 mb-8">
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={handleInputChange}
                placeholder="Search city..."
                className={`w-full bg-transparent border-none outline-none pl-4 pr-12 py-2 text-white placeholder-white/70 ${
                  inputError ? 'ring-2 ring-red-500' : ''
                }`}
              />
              <button 
                type="submit" 
                className="absolute right-4 top-2.5 text-white/70 hover:text-white"
                disabled={!!inputError || !city.trim()}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            {inputError && (
              <div className="text-red-400 text-sm mt-2 px-4">
                {inputError}
              </div>
            )}
      </form>

            {error && (
                      <div className="text-white text-center bg-red-500/20 backdrop-blur-lg rounded-lg p-4 mb-8">
                        {error}
                      </div>
      )}

          {loading ? (
            <div className="text-white text-center">Loading...</div>
          ) : weather && (
            <>
              <div className="bg-black/30 backdrop-blur-lg rounded-3xl p-8 text-white transform transition-all duration-500 hover:scale-[1.02] mb-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-2">{weather.city}</h1>
                  <p className="text-xl opacity-90">
                    {weather.description} ({weather.isDay ? 'Day' : 'Night'})
                  </p>
                </div>

                <div className="flex justify-center mb-8">
                  {getWeatherIcon(weather.condition, weather.isDay, "large")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-center justify-center space-x-4 transform transition-all duration-300 hover:scale-110">
                    <Thermometer className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-90">Temperature</p>
                      <p className="text-2xl font-bold">{weather.temp}°C</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4 transform transition-all duration-300 hover:scale-110">
                    <Droplets className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-90">Humidity</p>
                      <p className="text-2xl font-bold">{weather.humidity}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4 transform transition-all duration-300 hover:scale-110">
                    <Wind className="w-8 h-8" />
                    <div>
                      <p className="text-sm opacity-90">Wind Speed</p>
                      <p className="text-2xl font-bold">{weather.windSpeed} km/h</p>
                    </div>
                  </div>
                </div>
              </div>

              {forecast && (
                <div className="bg-black/30 backdrop-blur-lg rounded-3xl p-8 text-white">
                  <h2 className="text-2xl font-bold mb-6 text-center">7-Day Forecast</h2>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    {forecast.map(([day, data], index) => (
                      <div 
                        key={day}
                        onClick={() => setSelectedDay({ day, ...data })}
                        className="flex flex-col items-center p-4 rounded-lg bg-white/10 backdrop-blur-lg transform transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        <p className="font-medium mb-2">{day}</p>
                        {getWeatherIcon(data.condition, data.isDay, "small")}
                        <p className="mt-2 text-lg font-bold">{data.temp}°C</p>
                        <p className="text-sm opacity-80">{data.condition}</p>
                        <p className="text-xs opacity-60">{data.isDay ? 'Day' : 'Night'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDay && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-black/70 backdrop-blur-lg rounded-3xl p-8 text-white max-w-md w-full relative">
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="absolute top-4 right-4 text-white/70 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{selectedDay.day}</h3>
                      <p className="text-lg opacity-90">
                        {selectedDay.description} ({selectedDay.isDay ? 'Day' : 'Night'})
                      </p>
                    </div>

                    <div className="flex justify-center mb-6">
                      {getWeatherIcon(selectedDay.condition, selectedDay.isDay, "large")}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Thermometer className="w-6 h-6" />
                        <div>
                          <p className="text-sm opacity-90">Temperature</p>
                          <p className="text-xl font-bold">{selectedDay.temp}°C</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Droplets className="w-6 h-6" />
                        <div>
                          <p className="text-sm opacity-90">Humidity</p>
                          <p className="text-xl font-bold">{selectedDay.humidity}%</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Wind className="w-6 h-6" />
                        <div>
                          <p className="text-sm opacity-90">Wind Speed</p>
                          <p className="text-xl font-bold">{selectedDay.windSpeed} km/h</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        
        </div>
      </div>
    </div>
  );
}

export default App;