import type {
  CityLocation,
  Coordinates,
  DailyForecastItem,
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
  TemperatureUnit,
  WeatherCondition,
  WeatherReport,
} from '../types/weather';

const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export const PRESET_CITIES: readonly CityLocation[] = [
  {
    id: 'tokyo-jp',
    name: 'Tokyo',
    country: 'Japan',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
  },
  {
    id: 'london-gb',
    name: 'London',
    country: 'United Kingdom',
    coordinates: { latitude: 51.5072, longitude: -0.1276 },
  },
  {
    id: 'new-york-us',
    name: 'New York',
    country: 'United States',
    admin1: 'New York',
    coordinates: { latitude: 40.7128, longitude: -74.006 },
  },
  {
    id: 'nairobi-ke',
    name: 'Nairobi',
    country: 'Kenya',
    coordinates: { latitude: -1.2921, longitude: 36.8219 },
  },
];

export function convertCelsius(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return (celsius * 9) / 5 + 32;
  }
  return celsius;
}

export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit,
): string {
  const value = Math.round(convertCelsius(celsius, unit));
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';
  return `${value}${symbol}`;
}

export function formatWeekday(isoDate: string): string {
  const parts = isoDate.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return isoDate;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Maps standard WMO weather interpretation codes returned by Open-Meteo
 * into user-friendly descriptions, icons, and accent colors.
 */
export function getWeatherCondition(
  code: number,
  isDay = true,
): WeatherCondition {
  if (code === 0) {
    return {
      code,
      label: isDay ? 'Clear Sky' : 'Clear Night',
      icon: isDay ? '☀️' : '🌙',
      accentColor: isDay ? '#D97706' : '#4338CA',
    };
  }
  if (code === 1 || code === 2) {
    return {
      code,
      label: 'Partly Cloudy',
      icon: isDay ? '⛅' : '☁️',
      accentColor: '#2563EB',
    };
  }
  if (code === 3) {
    return {
      code,
      label: 'Overcast',
      icon: '☁️',
      accentColor: '#475569',
    };
  }
  if (code === 45 || code === 48) {
    return {
      code,
      label: 'Foggy',
      icon: '🌫️',
      accentColor: '#64748B',
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      code,
      label: 'Drizzle',
      icon: '🌦️',
      accentColor: '#0284C7',
    };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      code,
      label: 'Rain',
      icon: '🌧️',
      accentColor: '#1D4ED8',
    };
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return {
      code,
      label: 'Snow',
      icon: '❄️',
      accentColor: '#0EA5E9',
    };
  }
  if (code >= 95 && code <= 99) {
    return {
      code,
      label: 'Thunderstorm',
      icon: '⛈️',
      accentColor: '#6D28D9',
    };
  }

  return {
    code,
    label: 'Variable Conditions',
    icon: '🌤️',
    accentColor: '#334155',
  };
}

/**
 * Searches global cities using the free Open-Meteo Geocoding API (no API key required).
 */
export async function searchCities(
  query: string,
  signal?: AbortSignal,
): Promise<CityLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url =
    `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}` +
    '&count=5&language=en&format=json';

  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) {
    throw new Error(`City search failed (HTTP ${response.status}).`);
  }

  const payload = (await response.json()) as OpenMeteoGeocodingResponse;
  const results = payload.results ?? [];

  return results.map((item) => ({
    id: String(item.id),
    name: item.name,
    country: item.country ?? 'Unknown',
    ...(item.admin1 ? { admin1: item.admin1 } : {}),
    coordinates: {
      latitude: item.latitude,
      longitude: item.longitude,
    },
  }));
}

/**
 * Fetches current conditions and a 5-day forecast from Open-Meteo (no API key required).
 */
export async function fetchWeatherByCoordinates(
  coordinates: Coordinates,
  locationName: string,
  country?: string,
  signal?: AbortSignal,
): Promise<WeatherReport> {
  const queryParts = [
    `latitude=${encodeURIComponent(coordinates.latitude.toFixed(4))}`,
    `longitude=${encodeURIComponent(coordinates.longitude.toFixed(4))}`,
    'current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    'daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    'timezone=auto',
    'forecast_days=5',
  ];

  const url = `${FORECAST_BASE_URL}?${queryParts.join('&')}`;
  const response = await fetch(url, signal ? { signal } : undefined);

  if (!response.ok) {
    throw new Error(`Weather request failed (HTTP ${response.status}).`);
  }

  const payload = (await response.json()) as OpenMeteoForecastResponse;

  if (!payload.current || !payload.daily) {
    throw new Error('Weather service returned an incomplete forecast payload.');
  }

  const dailyItems: DailyForecastItem[] = [];
  const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max } =
    payload.daily;

  for (let index = 0; index < time.length; index += 1) {
    const date = time[index];
    if (date === undefined) {
      continue;
    }
    dailyItems.push({
      date,
      weatherCode: weather_code[index] ?? 0,
      tempMaxC: temperature_2m_max[index] ?? 0,
      tempMinC: temperature_2m_min[index] ?? 0,
      precipitationProbabilityMax: precipitation_probability_max[index] ?? 0,
    });
  }

  return {
    locationName,
    ...(country ? { country } : {}),
    coordinates: {
      latitude: payload.latitude,
      longitude: payload.longitude,
    },
    current: {
      temperatureC: payload.current.temperature_2m,
      apparentTemperatureC: payload.current.apparent_temperature,
      humidity: payload.current.relative_humidity_2m,
      windSpeedKmh: payload.current.wind_speed_10m,
      weatherCode: payload.current.weather_code,
      isDay: payload.current.is_day === 1,
      observedAt: payload.current.time,
    },
    daily: dailyItems,
    fetchedAt: new Date().toISOString(),
  };
}
