export const useWeatherIcon = () => {
  const getWeatherIcon = (weather: string): string => {
    const weatherIcons: Record<string, string> = {
      Clear: 'i-material-symbols-sunny',
      Clouds: 'i-material-symbols-cloud',
      Rain: 'i-material-symbols-rainy',
      Drizzle: 'i-material-symbols-rainy-light',
      Thunderstorm: 'i-material-symbols-thunderstorm',
      Snow: 'i-material-symbols-ac-unit',
      Mist: 'i-material-symbols-foggy',
      Smoke: 'i-material-symbols-foggy',
      Haze: 'i-material-symbols-foggy',
      Dust: 'i-material-symbols-foggy',
      Fog: 'i-material-symbols-foggy',
      Sand: 'i-material-symbols-foggy',
      Ash: 'i-material-symbols-foggy',
      Squall: 'i-material-symbols-air',
      Tornado: 'i-material-symbols-tornado'
    }
    return weatherIcons[weather] || 'i-material-symbols-partly-cloudy-day'
  }

  return {
    getWeatherIcon
  }
}
