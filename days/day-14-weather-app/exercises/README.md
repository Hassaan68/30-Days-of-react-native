# Day 14 Exercises: Interactive Horizontal Forecast Strip

Upgrade the weather forecast UI by building a scrollable, selectable horizontal `ForecastStrip` component in [`ForecastStripExercise.tsx`](./ForecastStripExercise.tsx).

## Tasks

### 1. Beginner — Horizontal `FlatList` of Daily Forecast Cards
- Render `items` inside a horizontal `FlatList` (`horizontal`, `showsHorizontalScrollIndicator={false}`) with `keyExtractor={(item) => item.date}`.
- For each card, display the date, weather symbol & label using `describeWeatherCode(item.weatherCode)`, and formatted high/low temperatures using `formatTemperature(..., unit)`.
- Handle an empty `items` array gracefully with a friendly empty state message.

### 2. Intermediate — Friendly Weekday Labels & Precipitation Badge
- Convert each ISO date string (`YYYY-MM-DD`) into a readable weekday label (show `"Today"` for index `0`, and short weekday names like `"Mon"`, `"Tue"` for subsequent days).
- Show a precipitation probability badge (e.g., `"Rain 40%"`) on each card.

### 3. Challenge — Selectable Day Card with Accessibility State
- Wrap each forecast card in a `Pressable` that calls `onSelectDay?.(item)`.
- Highlight the currently selected card (`item.date === selectedDate`) with a distinct border and background color.
- Add proper accessibility metadata: `accessibilityRole="button"`, `accessibilityState={{ selected: isSelected }}`, and a descriptive `accessibilityLabel`.

## Checking Your Work

Compare your completed component with [`../solutions/ForecastStripSolution.tsx`](../solutions/ForecastStripSolution.tsx) and run:

```bash
npm run typecheck
npm run lint
```
