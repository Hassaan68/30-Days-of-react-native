import { StyleSheet, Text, View } from 'react-native';
import type { DailyForecastItem, TemperatureUnit } from '../examples/weatherService';

export interface ForecastStripProps {
  items: DailyForecastItem[];
  unit: TemperatureUnit;
  selectedDate?: string;
  onSelectDay?: (item: DailyForecastItem) => void;
}

/**
 * Exercise Starter: Build a horizontal, selectable 5-day ForecastStrip component.
 *
 * TODOs:
 * 1. Import `FlatList`, `Pressable`, `describeWeatherCode`, and `formatTemperature`.
 * 2. Handle an empty `items` array with a clean empty-state card.
 * 3. Format each `item.date` into "Today" (for index 0) or a short weekday label.
 * 4. Render a horizontal `FlatList` where each card displays the day label, weather
 *    symbol, high/low temperature in `unit`, and precipitation probability.
 * 5. Highlight the card matching `selectedDate`, invoke `onSelectDay?.(item)` on press,
 *    and include `accessibilityRole="button"` + `accessibilityState={{ selected }}`.
 */
export function ForecastStripExercise({
  items,
  unit,
  selectedDate: _selectedDate,
  onSelectDay: _onSelectDay,
}: ForecastStripProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No forecast data available yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        TODO: Render {items.length} forecast day(s) in °{unit} using a horizontal FlatList.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
  placeholder: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  placeholderText: {
    fontSize: 14,
    color: '#1E3A8A',
  },
});
