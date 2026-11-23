import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  describeWeatherCode,
  formatTemperature,
  type DailyForecastItem,
  type TemperatureUnit,
} from '../examples/weatherService';

export interface ForecastStripProps {
  items: DailyForecastItem[];
  unit: TemperatureUnit;
  selectedDate?: string;
  onSelectDay?: (item: DailyForecastItem) => void;
}

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function formatDayLabel(isoDate: string, index: number): string {
  if (index === 0) {
    return 'Today';
  }
  const parts = isoDate.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (year === undefined || month === undefined || day === undefined) {
    return isoDate;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  const weekday = SHORT_WEEKDAYS[parsed.getUTCDay()];
  return weekday ?? isoDate;
}

export function ForecastStripSolution({
  items,
  unit,
  selectedDate,
  onSelectDay,
}: ForecastStripProps) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>No forecast data available yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      horizontal
      data={items}
      keyExtractor={(item) => item.date}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      renderItem={({ item, index }) => {
        const description = describeWeatherCode(item.weatherCode);
        const dayLabel = formatDayLabel(item.date, index);
        const high = formatTemperature(item.tempMaxC, unit);
        const low = formatTemperature(item.tempMinC, unit);
        const isSelected = item.date === selectedDate;

        return (
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
            <Text style={[styles.dayLabel, isSelected && styles.textSelected]}>{dayLabel}</Text>
            <Text style={styles.symbol}>{description.symbol}</Text>
            <Text style={[styles.highTemp, isSelected && styles.textSelected]}>{high}</Text>
            <Text style={[styles.lowTemp, isSelected && styles.subTextSelected]}>{low}</Text>
            <View style={[styles.rainBadge, isSelected && styles.rainBadgeSelected]}>
              <Text style={[styles.rainText, isSelected && styles.rainTextSelected]}>
                {Math.round(item.precipitationProbabilityMax)}% rain
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: 10,
    paddingVertical: 4,
  },
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
  card: {
    width: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  cardSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  symbol: {
    fontSize: 28,
  },
  highTemp: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  lowTemp: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  subTextSelected: {
    color: '#BFDBFE',
  },
  rainBadge: {
    marginTop: 2,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  rainBadgeSelected: {
    backgroundColor: '#1D4ED8',
  },
  rainText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  rainTextSelected: {
    color: '#EFF6FF',
  },
  pressed: {
    opacity: 0.85,
  },
});
