import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  formatTemperature,
  formatWeekday,
  getWeatherCondition,
} from '../services/openMeteo';
import type { TemperatureUnit, WeatherReport } from '../types/weather';

export interface WeatherCardProps {
  readonly report: WeatherReport;
  readonly unit: TemperatureUnit;
}

export function WeatherCard({
  report,
  unit,
}: WeatherCardProps): React.JSX.Element {
  const condition = getWeatherCondition(
    report.current.weatherCode,
    report.current.isDay,
  );

  return (
    <View style={styles.wrapper}>
      {/* Current Weather Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: condition.accentColor }]}>
        <View style={styles.locationBlock}>
          <Text style={styles.locationTitle}>{report.locationName}</Text>
          {report.country !== undefined && (
            <Text style={styles.locationSubtitle}>{report.country}</Text>
          )}
          <Text style={styles.coordsText}>
            {report.coordinates.latitude.toFixed(2)}°,{' '}
            {report.coordinates.longitude.toFixed(2)}°
          </Text>
        </View>

        <View style={styles.temperatureRow}>
          <Text
            style={styles.conditionIcon}
            accessibilityLabel={condition.label}
          >
            {condition.icon}
          </Text>
          <View>
            <Text style={styles.temperatureValue}>
              {formatTemperature(report.current.temperatureC, unit)}
            </Text>
            <Text style={styles.conditionLabel}>{condition.label}</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Feels Like</Text>
            <Text style={styles.metricValue}>
              {formatTemperature(report.current.apparentTemperatureC, unit)}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Humidity</Text>
            <Text style={styles.metricValue}>{report.current.humidity}%</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Wind</Text>
            <Text style={styles.metricValue}>
              {Math.round(report.current.windSpeedKmh)} km/h
            </Text>
          </View>
        </View>
      </View>

      {/* 5-Day Forecast Card */}
      <View style={styles.forecastCard}>
        <Text style={styles.forecastHeading}>5-Day Forecast</Text>
        <View style={styles.forecastList}>
          {report.daily.map((day, index) => {
            const dayCondition = getWeatherCondition(day.weatherCode, true);
            return (
              <View
                key={day.date}
                style={[
                  styles.forecastRow,
                  index < report.daily.length - 1 && styles.forecastRowBorder,
                ]}
              >
                <View style={styles.dayColumn}>
                  <Text style={styles.dayLabel}>
                    {index === 0 ? 'Today' : formatWeekday(day.date)}
                  </Text>
                  <Text style={styles.rainChance}>
                    Rain {day.precipitationProbabilityMax}%
                  </Text>
                </View>

                <View style={styles.conditionColumn}>
                  <Text style={styles.smallIcon}>{dayCondition.icon}</Text>
                  <Text style={styles.smallCondition} numberOfLines={1}>
                    {dayCondition.label}
                  </Text>
                </View>

                <View style={styles.rangeColumn}>
                  <Text style={styles.tempHigh}>
                    {formatTemperature(day.tempMaxC, unit)}
                  </Text>
                  <Text style={styles.tempLow}>
                    {formatTemperature(day.tempMinC, unit)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    gap: 18,
  },
  locationBlock: {
    gap: 2,
  },
  locationTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
  },
  coordsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 2,
  },
  temperatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  conditionIcon: {
    fontSize: 56,
  },
  temperatureValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 54,
  },
  conditionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  forecastHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  forecastList: {
    gap: 2,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 8,
  },
  forecastRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayColumn: {
    flex: 1.2,
    gap: 2,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  rainChance: {
    fontSize: 12,
    color: '#64748B',
  },
  conditionColumn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallIcon: {
    fontSize: 20,
  },
  smallCondition: {
    fontSize: 13,
    color: '#334155',
    flexShrink: 1,
  },
  rangeColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 78,
    justifyContent: 'flex-end',
  },
  tempHigh: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  tempLow: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
});
