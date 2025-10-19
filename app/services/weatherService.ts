import dayjs from 'dayjs'

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || ''
const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct'
// Using 5-day/3-hour forecast API (free tier)
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast'

interface GeocodingResult {
  lat: number
  lon: number
  name: string
  country: string
}

interface WeatherForecast {
  dt: number
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  temp: {
    day: number
    min: number
    max: number
  }
}

interface ForecastResponse {
  list: WeatherForecast[]
}

/** Get coordinates for a city using OpenWeatherMap Geocoding API */
async function getCityCoordinates(city: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `${GEOCODING_API_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.status)
      return null
    }
    
    const data = await response.json()
    return data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching city coordinates:', error)
    return null
  }
}

/** Get weather forecast for a specific date and city */
export async function getWeatherForecast(date: string, city: string): Promise<string | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeatherMap API key not configured')
    return null
  }

  try {
    // Get coordinates for the city
    const coords = await getCityCoordinates(city)
    if (!coords) {
      console.warn(`Could not find coordinates for city: ${city}`)
      return null
    }

    // Calculate days from today
    const targetDate = dayjs(date)
    const today = dayjs()
    const daysFromNow = targetDate.diff(today, 'day')

    // Skip past dates
    if (daysFromNow < 0) {
      return null
    }

    // Fetch 5-day/3-hour forecast
    const response = await fetch(
      `${FORECAST_API_URL}?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
    )

    if (!response.ok) {
      console.error('Weather API error:', response.status)
      return null
    }

    const data: ForecastResponse = await response.json()

    // If date is beyond 5 days, use the last available forecast (day 5)
    if (daysFromNow > 5) {
      const lastForecast = data.list[data.list.length - 1]
      if (lastForecast?.weather?.[0]?.main) {
        return lastForecast.weather[0].main
      }
      return null
    }

    // Find the forecast closest to noon on the target date
    const targetDateStart = targetDate.startOf('day')
    const targetDateEnd = targetDate.endOf('day')

    const forecast = data.list.find(item => {
      const forecastDate = dayjs.unix(item.dt)
      return forecastDate.isAfter(targetDateStart) && forecastDate.isBefore(targetDateEnd)
    })

    if (forecast?.weather?.[0]?.main) {
      return forecast.weather[0].main // e.g., "Rain", "Clear", "Clouds"
    }

    return null
  } catch (error) {
    console.error('Error fetching weather forecast:', error)
    return null
  }
}
