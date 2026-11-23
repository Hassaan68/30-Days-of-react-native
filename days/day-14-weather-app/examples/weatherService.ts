export type TemperatureUnit = 'C' | 'F';

export interface GeocodingResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  weatherCode: number;
  isDay: boolean;
  observedAt: string;
}

export interface DailyForecastItem {
  date: string;
  weatherCode: number;
  tempMaxC: number;
  tempMinC: number;
  precipitationProbabilityMax: number;
}

export interface WeatherReport {
  locationName: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  daily: DailyForecastItem[];
}

export interface WeatherDescription {
  label: string;
  symbol: string;
}

interface RawGeocodingResponse {
  results?: unknown;
}

interface RawForecastResponse {
  current?: {
    time?: unknown;
    temperature_2m?: unknown;
    relative_humidity_2m?: unknown;
    apparent_temperature?: unknown;
    is_day?: unknown;
    weather_code?: unknown;
    wind_speed_10m?: unknown;
  };
  daily?: {
    time?: unknown;
    weather_code?: unknown;
    temperature_2m_max?: unknown;
    temperature_2m_min?: unknown;
    precipitation_probability_max?: unknown;
  };
}

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number');
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Searches cities worldwide using Open-Meteo's free Geocoding API (no API key required).
 */
export async function searchCities(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=en&format=json`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`City search failed (HTTP ${response.status}). Please try again.`);
  }

  const data: unknown = await response.json();
  if (!isRecord(data)) {
    return [];
  }

  const rawResults = (data as RawGeocodingResponse).results;
  if (!Array.isArray(rawResults)) {
    return [];
  }

  const cities: GeocodingResult[] = [];
  for (const item of rawResults) {
    if (!isRecord(item)) {
      continue;
    }
    const { id, name, country, admin1, latitude, longitude, timezone } = item;
    if (
      typeof id === 'number' &&
      typeof name === 'string' &&
      typeof country === 'string' &&
      typeof latitude === 'number' &&
      typeof longitude === 'number'
    ) {
      cities.push({
        id,
        name,
        country,
        admin1: typeof admin1 === 'string' ? admin1 : undefined,
        latitude,
        longitude,
        timezone: typeof timezone === 'string' ? timezone : undefined,
      });
    }
  }

  return cities;
}

/**
 * Fetches current conditions and a 5-day daily forecast from Open-Meteo (no API key required).
 */
export async function fetchWeatherReport(
  params: { latitude: number; longitude: number; locationName: string },
  signal?: AbortSignal,
): Promise<WeatherReport> {
  const queryParts = [
    `latitude=${encodeURIComponent(String(params.latitude))}`,
    `longitude=${encodeURIComponent(String(params.longitude))}`,
    'current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    'daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    'timezone=auto',
    'forecast_days=5',
  ];
  const url = `${FORECAST_BASE_URL}?${queryParts.join('&')}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Weather request failed (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload)) {
    throw new Error('Received an unexpected weather response.');
  }

  const raw = payload as RawForecastResponse;
  const current = raw.current;
  const daily = raw.daily;

  if (
    !current ||
    typeof current.temperature_2m !== 'number' ||
    typeof current.apparent_temperature !== 'number' ||
    typeof current.relative_humidity_2m !== 'number' ||
    typeof current.wind_speed_10m !== 'number' ||
    typeof current.weather_code !== 'number' ||
    typeof current.time !== 'string'
  ) {
    throw new Error('Current weather data is incomplete.');
  }

  const dailyItems: DailyForecastItem[] = [];
  if (
    daily &&
    isStringArray(daily.time) &&
    isNumberArray(daily.weather_code) &&
    isNumberArray(daily.temperature_2m_max) &&
    isNumberArray(daily.temperature_2m_min) &&
    isNumberArray(daily.precipitation_probability_max)
  ) {
    for (let i = 0; i < daily.time.length; i += 1) {
      const date = daily.time[i];
      const weatherCode = daily.weather_code[i];
      const tempMaxC = daily.temperature_2m_max[i];
      const tempMinC = daily.temperature_2m_min[i];
      const precipitationProbabilityMax = daily.precipitation_probability_max[i];

      if (
        date !== undefined &&
        weatherCode !== undefined &&
        tempMaxC !== undefined &&
        tempMinC !== undefined &&
        precipitationProbabilityMax !== undefined
      ) {
        dailyItems.push({
          date,
          weatherCode,
          tempMaxC,
          tempMinC,
          precipitationProbabilityMax,
        });
      }
    }
  }

  return {
    locationName: params.locationName,
    latitude: params.latitude,
    longitude: params.longitude,
    current: {
      temperatureC: current.temperature_2m,
      apparentTemperatureC: current.apparent_temperature,
      humidityPercent: current.relative_humidity_2m,
      windSpeedKmh: current.wind_speed_10m,
      weatherCode: current.weather_code,
      isDay: current.is_day !== 0,
      observedAt: current.time,
    },
    daily: dailyItems,
  };
}

/**
 * Maps WMO Weather Interpretation Codes returned by Open-Meteo to friendly labels.
 */
export function describeWeatherCode(code: number): WeatherDescription {
  if (code === 0) {
    return { label: 'Clear Sky', symbol: '☀' };
  }
  if (code === 1 || code === 2) {
    return { label: 'Partly Cloudy', symbol: '⛅' };
  }
  if (code === 3) {
    return { label: 'Overcast', symbol: '☁' };
  }
  if (code === 45 || code === 48) {
    return { label: 'Foggy', symbol: '〰' };
  }
  if (code >= 51 && code <= 57) {
    return { label: 'Drizzle', symbol: '☂' };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { label: 'Rain', symbol: '☔' };
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { label: 'Snow', symbol: '❄' };
  }
  if (code >= 95) {
    return { label: 'Thunderstorm', symbol: '⚡' };
  }
  return { label: 'Mixed Conditions', symbol: '☁' };
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = unit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(value)}°${unit}`;
}
