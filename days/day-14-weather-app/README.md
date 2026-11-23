# Day 14: Build a Weather App

## Learning Objectives

By the end of Day 14 (our **Week 2 Capstone**), you will be able to:

- Combine Week 2 skills—API integration, input handling, state management, device GPS location, and responsive layout—into a complete mobile application.
- Fetch live city geocoding and weather forecasts from the free, zero-API-key **Open-Meteo API** using strictly typed `fetch` services.
- Manage real-world async UI states: loading, empty search results, network errors with retry, and pull-to-refresh (`RefreshControl`).
- Cancel stale in-flight network requests with `AbortController` when users switch cities quickly.
- Adapt layout columns dynamically for phones and tablets with `useWindowDimensions`.

## Prerequisites

- Completion of Week 2 ([Day 08](../day-08-navigation-expo-router/README.md) through [Day 13](../day-13-device-features/README.md)).
- Internet connection on your device or simulator to query the public Open-Meteo endpoints (**no API key or account required**).

## Why This Concept Matters

Individual tutorials are easy to follow in isolation, but real mobile engineering happens when features have to work *together*: a search box that triggers an API call, a GPS button whose permission might be denied, a user pulling down to refresh while switching cities, and a layout that must look sharp on both a compact phone and an iPad. Building a live, multi-feature capstone app at the end of Week 2 cements how networking, device hardware, error recovery, and responsive styling fit together in production codebases.

## Introduction

Welcome to the **Week 2 Capstone**! Over the past six days you learned how to navigate between screens, validate forms, structure app state, talk to REST APIs, authenticate users, and tap into native device hardware. Today you will bring those building blocks together to build a real, live **Weather App**.

To keep setup completely frictionless, our app uses the public **Open-Meteo API**—**zero API keys, zero signups, and zero `.env` configuration required**. That means the Weather App runs immediately out of the box when you launch this repository's shared Expo workspace (`npm start`) or drop the files into your own Expo project. You can search any city on Earth, fetch live current conditions and a 5-day forecast, pull down to refresh, toggle between Celsius and Fahrenheit, or tap **"Use My Current Location"** to load weather from your phone's GPS.

## Concepts

> **React Web vs. React Native in a Data-Driven Screen**
>
> - **Responsive layout**: Instead of CSS `@media (min-width: 440px)` queries, React Native uses the `useWindowDimensions()` hook so layouts adapt dynamically to phones, tablets, split-screen mode, and orientation changes.
> - **Keyboard taps**: On mobile, tapping a search suggestion while the virtual keyboard is open normally dismisses the keyboard *first* unless you add `keyboardShouldPersistTaps="handled"` to `ScrollView`.
> - **Refresh & location**: Users expect native pull-to-refresh (`RefreshControl`) and a respectful GPS flow (`expo-location`) paired with a manual city-search fallback when location access is denied.

### 1. Separating Networking from UI (`weatherService.ts`)

Instead of calling `fetch()` directly inside `WeatherScreen.tsx`, we isolate all Open-Meteo URLs, response parsing, WMO weather-code mapping, and temperature conversion inside a dedicated service module (`examples/weatherService.ts`):

- **Geocoding endpoint**: `https://geocoding-api.open-meteo.com/v1/search` converts a user's city name (e.g., `"Tokyo"`) into `{ latitude, longitude, country, admin1 }`.
- **Forecast endpoint**: `https://api.open-meteo.com/v1/forecast` accepts `latitude` and `longitude` and returns current temperature, feels-like temperature, humidity, wind speed, WMO weather code, and a 5-day daily forecast.
- **Runtime type narrowing**: External APIs are untrusted `unknown` data. Narrowing fields with helper guards (`isRecord`, `isNumberArray`, `isStringArray`) keeps strict TypeScript honest with zero `any` casts.

### 2. Canceling Stale Requests with `AbortController`

Imagine a user taps **Tokyo**, and 100ms later taps **Nairobi**. If the slower Tokyo response arrives *after* Nairobi, your UI would show the wrong city's weather! Keeping the active `AbortController` in a `useRef` lets us abort the previous request immediately before starting the next one—and abort on unmount so we never update unmounted state.

### 3. Designing All Four Async States

Every network-backed mobile screen should explicitly design for:

1. **Loading** — Centered `ActivityIndicator` on initial fetch (and subtle `RefreshControl` spinner on pull-to-refresh so existing content stays visible).
2. **Success** — Hero weather card, responsive metric tiles, and 5-day forecast.
3. **Empty** — Helpful message when a city search yields zero matches (`No cities matched "..."`).
4. **Error** — Clear message banner with a one-tap **Retry** button (and **Open Settings** if GPS permission was permanently denied).

### 4. Pull-to-Refresh & Responsive Layout

- **`RefreshControl`**: Attach `refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={...} />}` to `ScrollView` (or `FlatList`) so users get the familiar native pull-down refresh gesture.
- **`useWindowDimensions`**: Read the current screen width dynamically (which also updates on device rotation and split-screen tablets) to switch our metric tiles from a 2-column wrapped layout on compact phones to a single 3-column row on wider devices.

### 5. Week 2 Review

Take a moment to appreciate how every Week 2 topic connects in real production apps:

| Day | Core Skill | How It Appears in Real Apps (Including Today) |
| --- | --- | --- |
| Day 08 | Expo Router Navigation | Multi-screen structure, stacks, tabs, and deep links |
| Day 09 | Forms & Validation | Controlled city search input & trimmed length validation |
| Day 10 | State Management | Clean UI state modeling & unit preference (`°C` / `°F`) |
| Day 11 | API Integration | Typed `fetch` service, error handling, `AbortController` |
| Day 12 | Authentication | Secure session storage with `expo-secure-store` & route guards |
| Day 13 | Device Features | `expo-location` GPS lookup, `Linking.openSettings()`, `expo-haptics` |
| Day 14 | Weather Capstone | Bringing APIs, device hardware, pull-to-refresh, and responsive UI together |

## Code Examples

Because Open-Meteo requires **zero API keys**, you can run the Weather App immediately via `npm start` in this repository's shared Expo workspace—or copy both files into your own Expo project at the paths below:

### 1. Open-Meteo Weather Service (`examples/weatherService.ts`)

- **Type**: **Reusable helper/service module** (place in `src/services/weatherService.ts` or `lib/weatherService.ts` in your Expo project).
- Read [`./examples/weatherService.ts`](./examples/weatherService.ts) to see:
  - Strongly typed domain models (`GeocodingResult`, `CurrentWeather`, `DailyForecastItem`, `WeatherReport`).
  - `searchCities(query, signal)` and `fetchWeatherReport(params, signal)` with zero API keys required.
  - Safe array indexing compatible with `noUncheckedIndexedAccess: true`.
  - `describeWeatherCode(code)` and `formatTemperature(celsius, unit)`.

### 2. Complete Weather Screen (`examples/WeatherScreen.tsx`)

- **Type**: **Runnable screen component** (place in `app/weather.tsx` or `src/screens/WeatherScreen.tsx` in your Expo project, or preview right away via `npm start` in this repository's shared Expo workspace).
- Read [`./examples/WeatherScreen.tsx`](./examples/WeatherScreen.tsx) to see how `WeatherScreen` orchestrates city search, GPS weather lookup, °C/°F toggling, `RefreshControl`, `useWindowDimensions`, and error recovery.

## Step-by-Step Explanation

1. **Default Load**: On mount, `selectedLocation` defaults to London so the learner immediately sees live data rather than a blank screen.
2. **City Search**: Typing at least 2 characters and tapping **Search** calls `searchCities()`. Tapping any result updates `selectedLocation`, collapses the dropdown, triggers a light selection haptic, and fetches the new forecast.
3. **Current Location**: Tapping **Use My Current Location** follows Day 13's permission lifecycle—requesting foreground permission, reading `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`, and passing the coordinates directly into `fetchWeatherReport()`.
4. **Pull-to-Refresh**: Pulling down sets `isRefreshing = true` (leaving the existing hero card visible) and calls `loadWeather(selectedLocation, 'refresh')`.
5. **Unit Switching**: Toggling `°C` / `°F` is pure presentation logic via `formatTemperature()`—no extra API call is needed!

## Expected Output

When you launch `WeatherScreen.tsx` (via `npm start` in the shared Expo workspace or your own project), it loads live weather for London automatically—no API key setup needed:

```text
+------------------------------------------+
| Weather                            [ °C ]|
| [ Search city (e.g., Tokyo...) ][Search] |
| [       Use My Current Location        ] |
+------------------------------------------+
|  +------------------------------------+  |
|  |       London, United Kingdom       |  |
|  |                ⛅                  |  |
|  |               14°C                 |  |
|  |           Partly Cloudy            |  |
|  |         Pull down to refresh       |  |
|  +------------------------------------+  |
|  [Feels Like: 13°C]  [Humidity: 72%]     |
|  [Wind: 16 km/h]                         |
|                                          |
|  5-Day Forecast                          |
|  2026-11-23   ⛅ Partly Cloudy   15° / 9°|
|  2026-11-24   ☔ Rain            12° / 8°|
|  ...                                     |
+------------------------------------------+
```

- **Search**: Typing `"Tokyo"` and tapping **Search** displays a clickable dropdown of matching cities; selecting one updates the hero card and 5-day forecast immediately.
- **Unit toggle**: Tapping **`°C`** switches every temperature on screen to **`°F`** instantaneously with zero extra network calls.
- **GPS lookup**: Tapping **Use My Current Location** requests foreground location access and loads local weather (or shows a helpful error card with **Open Settings** if permanently denied).
- **Wide screens**: On tablets or landscape devices (`width >= 440`), the three metric tiles (**Feels Like**, **Humidity**, **Wind**) arrange into a single 3-column row.

## Common Mistakes

1. **Refetching the API just to switch °C and °F**: Convert temperatures client-side from a single canonical Celsius value so toggling is instant and works offline.
2. **Ignoring `AbortError` in `catch` blocks**: Aborting a superseded request throws an `AbortError`; always check `err.name === 'AbortError'` and exit silently instead of flashing an error banner to the user.
3. **Clearing the whole screen during pull-to-refresh**: Keep the previous `report` mounted while `isRefreshing` is `true` so the user does not experience jarring layout jumps.
4. **Assuming parallel API arrays always have identical lengths**: Under `noUncheckedIndexedAccess: true`, always guard each indexed value (`daily.time[i]`, `daily.temperature_2m_max[i]`, etc.) before constructing your `DailyForecastItem`.
5. **Hardcoding screen widths with `Dimensions.get('window')` outside render**: `Dimensions.get()` does not react to screen rotation or foldable resize events. Always use the `useWindowDimensions()` hook.

## Best Practices

- Keep API parsing and domain formatting in pure TypeScript modules (`weatherService.ts`) so they can be unit-tested cleanly without rendering native components (which we will practice on Day 20!).
- Always provide a manual city search fallback alongside GPS location so users who decline location permission still have a great experience.
- Use `keyboardShouldPersistTaps="handled"` on `ScrollView` so users can tap a search suggestion immediately without needing a second tap to dismiss the keyboard.
- Include meaningful `accessibilityLabel` strings on compact controls like the `°C` / `°F` toggle pill.

## Exercises

Open [`./exercises/README.md`](./exercises/README.md) and complete [`./exercises/ForecastStripExercise.tsx`](./exercises/ForecastStripExercise.tsx):

- **Beginner**: Render a horizontal `FlatList` of daily forecast cards with formatted temperatures and an empty state.
- **Intermediate**: Format ISO dates into `"Today"` / short weekday labels (`Mon`, `Tue`, ...) and display precipitation probability badges.
- **Challenge**: Make each card selectable (`selectedDate` + `onSelectDay`) with distinct active styling and full accessibility metadata (`accessibilityRole`, `accessibilityState`, `accessibilityLabel`).

## Solutions

Try building `ForecastStripExercise.tsx` on your own first before expanding the solution walkthrough below.

<details>
<summary>Click to view solution notes & links</summary>

- [`./solutions/ForecastStripSolution.tsx`](./solutions/ForecastStripSolution.tsx) — Horizontal `FlatList` forecast strip demonstrating:
  - UTC-safe ISO date parsing (`Date.UTC(year, month - 1, day)` + `getUTCDay()`) so weekday labels never shift by a day in western time zones.
  - `describeWeatherCode()` and `formatTemperature()` reused directly from `weatherService.ts`.
  - Distinct selected-card theme (`#1E3A8A` surface with white text) and full screen-reader announcements (`accessibilityRole="button"`, `accessibilityState={{ selected }}`, and a rich `accessibilityLabel`).

</details>

## Mini Project

Enhance `WeatherScreen.tsx` into your own personalized Weather App:

1. Replace the vertical 5-day forecast list in `WeatherScreen.tsx` with `ForecastStripSolution`.
2. Track `selectedDate` in state and show a detailed summary card underneath the strip for whichever day the user taps (high/low, condition, precipitation chance).
3. Add a **Saved Cities** horizontal chip bar persisted with `@react-native-async-storage/async-storage` so your favorite cities survive app restarts.

Want to build the full multi-screen featured project? Head over to [Project 02: Weather App](../../projects/project-02-weather-app/README.md).

## Key Takeaways

- Separating pure API services (`weatherService.ts`) from screen components (`WeatherScreen.tsx`) keeps React Native codebases readable and testable.
- Open-Meteo requires zero API keys, letting you run live geocoding and weather forecasts immediately in the shared Expo workspace (`npm start`) or your own app.
- `AbortController`, `RefreshControl`, `useWindowDimensions`, and graceful GPS fallbacks turn a basic API demo into a polished mobile experience.
- Congratulations on completing **Week 2**! You can now build data-driven, authenticated, hardware-aware mobile apps.

## Further Reading

- [Open-Meteo Weather Forecast API Docs](https://open-meteo.com/en/docs)
- [Open-Meteo Geocoding API Docs](https://open-meteo.com/en/docs/geocoding-api)
- [React Native `RefreshControl` Documentation](https://reactnative.dev/docs/refreshcontrol)
- [React Native `useWindowDimensions` Documentation](https://reactnative.dev/docs/usewindowdimensions)

## Progress Checklist

- [ ] Read `examples/weatherService.ts` and understand Open-Meteo geocoding + forecast parsing
- [ ] Run `examples/WeatherScreen.tsx` (via `npm start` or your playground), search a city, toggle °C/°F, and test pull-to-refresh
- [ ] Test "Use My Current Location" and verify graceful fallback if permission is denied
- [ ] Complete `exercises/ForecastStripExercise.tsx` and compare with `solutions/ForecastStripSolution.tsx`
- [ ] Celebrate finishing Week 2!

## Next Day

Start **Week 3** with [Day 15: Animations](../day-15-animations/README.md) to bring your mobile interfaces to life with smooth 60–120 FPS motion using Reanimated and Gesture Handler!
