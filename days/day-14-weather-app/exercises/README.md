# Day 14 Exercises: Interactive Horizontal Forecast Strip

Upgrade the weather forecast UI by building a scrollable, selectable horizontal `ForecastStrip` component in [`ForecastStripExercise.tsx`](./ForecastStripExercise.tsx).

## How to Practise

1. Open [`ForecastStripExercise.tsx`](./ForecastStripExercise.tsx) and complete each `TODO` step (Beginner → Intermediate → Challenge).
2. Wire your component into `WeatherScreen.tsx` (passing `report.daily` and `unit`) inside your Expo app / playground (or preview via `npm start` in this repository's shared Expo workspace).
3. Run the typecheck and linter from the repository root:

```bash
npm run typecheck
npm run lint
```

---

## Beginner — Horizontal `FlatList` of Daily Forecast Cards

### Requirements
- Import `FlatList` from `'react-native'` and import `describeWeatherCode` and `formatTemperature` from `'../examples/weatherService'`.
- Keep the empty-state guard so an empty `items` array renders a clean `"No forecast data available yet."` card.
- Render `items` inside a horizontal `FlatList` (`horizontal`, `showsHorizontalScrollIndicator={false}`) using `keyExtractor={(item) => item.date}`.
- On each card, display the date, weather symbol from `describeWeatherCode(item.weatherCode)`, and high/low temperatures formatted with `formatTemperature(..., unit)`.

### Acceptance Criteria
- [ ] Cards scroll horizontally without a distracting scrollbar (`showsHorizontalScrollIndicator={false}`).
- [ ] Toggling `unit` between `'C'` and `'F'` updates all high/low temperatures cleanly without modifying the underlying data.
- [ ] Passing `items={[]}` renders the empty-state card instead of an empty blank gap.

### Expected Behavior
Users can flick horizontally across 5 neatly spaced forecast cards showing each day's weather icon and high/low temperature.

<details>
<summary>Hint</summary>

Use `contentContainerStyle={{ gap: 10, paddingVertical: 4 }}` on `FlatList` for consistent horizontal spacing between cards without needing manual right margins.

</details>

---

## Intermediate — Friendly Weekday Labels & Precipitation Badge

### Requirements
- Write a `formatDayLabel(isoDate: string, index: number): string` helper:
  - Return `'Today'` when `index === 0`.
  - Parse `YYYY-MM-DD` safely using `Date.UTC(year, month - 1, day)` and map `parsed.getUTCDay()` to a short weekday name (`'Sun'` through `'Sat'`).
  - Guard all indexed array accesses so strict TypeScript (`noUncheckedIndexedAccess: true`) passes with zero unsafe casts.
- Display a precipitation probability badge on each card (for example, `40% rain` using `Math.round(item.precipitationProbabilityMax)`).

### Acceptance Criteria
- [ ] The first card displays `"Today"`, and subsequent cards show 3-letter weekdays (`"Tue"`, `"Wed"`, etc.) accurately regardless of the device's local timezone.
- [ ] Every card shows a rounded precipitation badge (`XX% rain`).
- [ ] Zero TypeScript errors under `noUncheckedIndexedAccess: true`.

### Expected Behavior
Instead of raw ISO strings like `"2026-11-24"`, users immediately scan `"Today"`, `"Tue"`, `"Wed"` alongside each day's rain chance.

<details>
<summary>Hint</summary>

Avoid `new Date("2026-11-24").getDay()`, which can shift backward by one day in negative UTC offsets (like US time zones)! Parse parts explicitly with `Date.UTC`:

```ts
const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function formatDayLabel(isoDate: string, index: number): string {
  if (index === 0) return 'Today';
  const [year, month, day] = isoDate.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return isoDate;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return SHORT_WEEKDAYS[parsed.getUTCDay()] ?? isoDate;
}
```

</details>

---

## Challenge — Selectable Day Card with Accessibility State

### Requirements
- Wrap each forecast card in a `Pressable` that invokes `onSelectDay?.(item)` when tapped.
- Compute `const isSelected = item.date === selectedDate;` and apply distinct selected styles (for example, a dark-blue card background `#1E3A8A` with high-contrast white/light-blue text and badge styling).
- Add complete accessibility props to every card's `Pressable`:
  - `accessibilityRole="button"`
  - `accessibilityState={{ selected: isSelected }}`
  - Descriptive `accessibilityLabel` reading out the day label, condition label, high/low temperatures, and precipitation percentage.

### Acceptance Criteria
- [ ] Tapping any forecast card triggers `onSelectDay(item)` and visually highlights that card when `selectedDate` updates.
- [ ] Screen readers (VoiceOver / TalkBack) announce the card as a button, its selected state, and its full weather summary in one clear phrase.
- [ ] `npm run typecheck` and `npm run lint` pass with zero errors.

### Expected Behavior
Tapping a day highlights the selected card with crisp visual contrast and enables a parent screen to reveal detailed metrics for that chosen day.

<details>
<summary>Hint</summary>

Compose conditional styles cleanly inside `Pressable`'s `style` function:

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityState={{ selected: isSelected }}
  accessibilityLabel={`${dayLabel}, ${description.label}, high ${high}, low ${low}, ${item.precipitationProbabilityMax} percent chance of precipitation`}
  onPress={() => onSelectDay?.(item)}
  style={({ pressed }) => [
    styles.card,
    isSelected && styles.cardSelected,
    pressed && styles.pressed,
  ]}
>
```

</details>

---

## Reference Solution

<details>
<summary>Only after trying — view reference solution</summary>

Compare your completed component against [`../solutions/ForecastStripSolution.tsx`](../solutions/ForecastStripSolution.tsx), then run:

```bash
npm run typecheck
npm run lint
```

</details>
