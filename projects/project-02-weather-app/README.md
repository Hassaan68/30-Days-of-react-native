# Project 02: Live Weather App

> **Aligned with:** [Day 14: Build a Real Weather App](../../days/day-14-weather-app/README.md)  
> **Difficulty:** Intermediate  
> **Estimated Time:** 3–4 hours

## Project Overview

The **Live Weather App** combines asynchronous API networking, device GPS access, and responsive mobile UI design. It fetches real-time current weather conditions and a 5-day forecast from the free **[Open-Meteo API](https://open-meteo.com/)**—which requires **zero API keys, zero sign-up, and zero credit cards**—paired with **`expo-location`** for foreground GPS lookup and global city search.

You will practice structuring an external service layer cleanly separate from your React Native UI components, handling request cancellation with `AbortController`, translating WMO weather interpretation codes into user-friendly visual states, and building resilient loading, empty, pull-to-refresh, and error UI states.

## Features

- **No-Key Live Weather API**: Fetches current temperature, feels-like temperature, humidity, wind speed, day/night state, and 5-day high/low forecasts from Open-Meteo.
- **Global City Search**: Search any city worldwide using the Open-Meteo Geocoding API and select from matching locations.
- **GPS Location Lookup**: Requests foreground location permissions via `expo-location` and loads live weather for the user's current coordinates.
- **Quick Preset Cities**: One-tap chips for Tokyo, London, New York, and Nairobi so you can test instantaneously on simulators without configuring mock GPS coordinates.
- **Celsius / Fahrenheit Toggle**: Instant unit conversion (`°C` ↔ `°F`) across both the hero card and the 5-day forecast list.
- **Pull-to-Refresh & Request Cancellation**: Uses `RefreshControl` for manual reloads and `AbortController` to prevent stale network responses from overwriting newer city selections.
- **Graceful Error Handling**: Clear permission-denied messaging and a retryable error banner if the device is offline.

## Technologies

| Tool / Library | Purpose |
| --- | --- |
| **React Native 0.88** | Native UI components (`ScrollView`, `TextInput`, `Pressable`, `RefreshControl`, `ActivityIndicator`) |
| **Expo SDK 58** | Managed mobile runtime and `expo-status-bar` |
| **expo-location** | Runtime foreground permission prompts and GPS coordinate retrieval |
| **Open-Meteo REST API** | Free, open-source weather forecast & geocoding endpoints (no API key required) |
| **TypeScript 5.8** | Strict API response interfaces and safe array indexing (`noUncheckedIndexedAccess: true`) |
| **react-native-safe-area-context** | Safe layout padding around device notches and gesture indicators |

## Screens

1. **Weather Home Screen ([`src/screens/WeatherHomeScreen.tsx`](./src/screens/WeatherHomeScreen.tsx))**
   - Top header with `°C / °F` toggle and **Use GPS** button.
   - City search bar with inline dropdown suggestions.
   - Horizontal preset city chips for instant switching.
   - Dynamic [`WeatherCard`](./src/components/WeatherCard.tsx) hero banner whose accent color adapts to the active weather code (clear sky, clouds, rain, snow, storm) plus a 5-day forecast table.

## Folder Structure

```text
projects/project-02-weather-app/
├── README.md
└── src/
    ├── components/
    │   └── WeatherCard.tsx           # Hero current-weather banner + 5-day forecast list
    ├── screens/
    │   └── WeatherHomeScreen.tsx     # Search, GPS lookup, unit toggle, pull-to-refresh
    ├── services/
    │   └── openMeteo.ts              # Open-Meteo forecast & geocoding API client + WMO mapper
    └── types/
        └── weather.ts                # Strictly typed weather domain & API response interfaces
```

## Implementation Steps

1. **Define domain and API response types** ([`src/types/weather.ts`](./src/types/weather.ts))
   - Separate raw Open-Meteo API payload shapes (`OpenMeteoForecastResponse`, `OpenMeteoGeocodingResponse`) from clean UI domain models (`WeatherReport`, `CurrentWeather`, `DailyForecastItem`).
   - Keeping raw API types separate makes it trivial to swap weather providers later without touching UI components.
2. **Build the Open-Meteo service layer** ([`src/services/openMeteo.ts`](./src/services/openMeteo.ts))
   - Implement `fetchWeatherByCoordinates()` hitting `https://api.open-meteo.com/v1/forecast` with `current`, `daily`, `timezone=auto`, and `forecast_days=5`.
   - Implement `searchCities()` hitting `https://geocoding-api.open-meteo.com/v1/search`.
   - Implement `getWeatherCondition()` to translate numeric WMO weather codes (`0`, `1–3`, `45–48`, `51–67`, `71–77`, `95–99`) into labels, icons, and card accent colors.
   - Guard array lookups (`daily.time[index]`, `weather_code[index] ?? 0`) so strict TypeScript with `noUncheckedIndexedAccess` compiles cleanly.
3. **Create the presentational WeatherCard** ([`src/components/WeatherCard.tsx`](./src/components/WeatherCard.tsx))
   - Accept a `WeatherReport` and `TemperatureUnit` as read-only props.
   - Render the adaptive-color hero banner (current temperature, condition label, feels-like, humidity, wind speed) followed by the 5-day forecast card with rain probability and high/low temperatures.
4. **Build WeatherHomeScreen with GPS & Search** ([`src/screens/WeatherHomeScreen.tsx`](./src/screens/WeatherHomeScreen.tsx))
   - Wrap the screen in `SafeAreaView` from `react-native-safe-area-context`.
   - Fetch weather inside a `useEffect` backed by `AbortController` so rapid city taps cancel in-flight requests cleanly.
   - Wire the **Use GPS** button to `Location.requestForegroundPermissionsAsync()` and `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`.
   - Provide pull-to-refresh (`RefreshControl`) and accessible error alerts with a one-tap **Retry** button.

## Complete Code Overview

| File | Responsibility | Key Concepts |
| --- | --- | --- |
| [`src/types/weather.ts`](./src/types/weather.ts) | Domain models and Open-Meteo JSON response contracts | API DTO vs. UI model separation |
| [`src/services/openMeteo.ts`](./src/services/openMeteo.ts) | Forecast fetching, city geocoding, temperature formatting, WMO mapping | `fetch`, `AbortSignal`, pure formatting utilities |
| [`src/components/WeatherCard.tsx`](./src/components/WeatherCard.tsx) | Displays current conditions, weather metrics, and 5-day forecast | Reusable presentational UI, dynamic colors |
| [`src/screens/WeatherHomeScreen.tsx`](./src/screens/WeatherHomeScreen.tsx) | Coordinates GPS, city search, unit toggle, and async screen states | `expo-location`, `RefreshControl`, `AbortController`, `SafeAreaView` |

### Related Curriculum Lessons

- [Day 11: API Integration & Async Data](../../days/day-11-api-integration/README.md)
- [Day 13: Device Features & Permissions](../../days/day-13-device-features/README.md)
- [Day 14: Build a Real Weather App](../../days/day-14-weather-app/README.md)

## Testing Instructions

### 1. Static Verification (TypeScript & ESLint)

From the repository root, run:

```bash
npm run typecheck
npm run lint
```

### 2. Run on a Simulator or Physical Device

1. Render `<WeatherHomeScreen />` inside a `<SafeAreaProvider>` in your Expo app root.
2. Start Expo with `npm start` and open iOS Simulator, Android Emulator, or Expo Go.
3. On iOS Simulator, simulate GPS coordinates via **Features → Location → Custom Location…** before tapping **Use GPS**.

### 3. Manual QA Checklist

- [ ] App loads live weather for Tokyo on initial mount without needing any API key.
- [ ] Tapping `°C` / `°F` immediately converts current, feels-like, and all 5-day high/low temperatures.
- [ ] Searching a city (e.g., `"Lisbon"` or `"Seoul"`) displays matching geocoding results and updates the forecast when tapped.
- [ ] Tapping **Use GPS** requests foreground location permission and fetches coordinates-based weather (or shows a helpful message when denied).
- [ ] Pulling down on the screen triggers `RefreshControl` and updates the forecast.
- [ ] Turning on Airplane Mode shows the error banner and tapping **Retry** recovers once connectivity returns.

## Future Improvements

- **Cache Last Forecast Offline**: Save the last selected city and weather report in `AsyncStorage` ([Day 17](../../days/day-17-local-storage-and-offline/README.md)) so the app opens immediately even without signal.
- **TanStack Query Integration**: Replace manual `useEffect` fetching with `@tanstack/react-query` ([Day 11](../../days/day-11-api-integration/README.md)) for automatic stale-while-revalidate caching and background refetches.
- **Hourly Forecast Chart**: Request Open-Meteo's `hourly=temperature_2m,precipitation_probability` parameter and render a horizontal hourly strip.
- **Favorite Cities List**: Allow pinning multiple cities and navigating between them with Expo Router ([Day 08](../../days/day-08-navigation-expo-router/README.md)).
- **Unit & Mocked API Tests**: Add Jest tests for `getWeatherCondition`, `formatTemperature`, and mocked `fetch` responses ([Day 20](../../days/day-20-testing/README.md)).
- **Continue Learning**: Go back to [Project 01: Developer Profile App](../project-01-profile-app/README.md) or advance to [Project 03: Offline-First Task Manager](../project-03-task-manager/README.md).
