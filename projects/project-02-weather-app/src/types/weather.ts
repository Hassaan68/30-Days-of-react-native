export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface CityLocation {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly admin1?: string;
  readonly coordinates: Coordinates;
}

export interface WeatherCondition {
  readonly code: number;
  readonly label: string;
  readonly icon: string;
  readonly accentColor: string;
}

export interface CurrentWeather {
  readonly temperatureC: number;
  readonly apparentTemperatureC: number;
  readonly humidity: number;
  readonly windSpeedKmh: number;
  readonly weatherCode: number;
  readonly isDay: boolean;
  readonly observedAt: string;
}

export interface DailyForecastItem {
  readonly date: string;
  readonly weatherCode: number;
  readonly tempMaxC: number;
  readonly tempMinC: number;
  readonly precipitationProbabilityMax: number;
}

export interface WeatherReport {
  readonly locationName: string;
  readonly country?: string;
  readonly coordinates: Coordinates;
  readonly current: CurrentWeather;
  readonly daily: readonly DailyForecastItem[];
  readonly fetchedAt: string;
}

export interface OpenMeteoForecastResponse {
  readonly latitude: number;
  readonly longitude: number;
  readonly current?: {
    readonly time: string;
    readonly temperature_2m: number;
    readonly relative_humidity_2m: number;
    readonly apparent_temperature: number;
    readonly is_day: number;
    readonly weather_code: number;
    readonly wind_speed_10m: number;
  };
  readonly daily?: {
    readonly time: readonly string[];
    readonly weather_code: readonly number[];
    readonly temperature_2m_max: readonly number[];
    readonly temperature_2m_min: readonly number[];
    readonly precipitation_probability_max: readonly number[];
  };
}

export interface OpenMeteoGeocodingResult {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country?: string;
  readonly admin1?: string;
}

export interface OpenMeteoGeocodingResponse {
  readonly results?: readonly OpenMeteoGeocodingResult[];
}
