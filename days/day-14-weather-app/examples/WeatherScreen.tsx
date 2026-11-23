import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  describeWeatherCode,
  fetchWeatherReport,
  formatTemperature,
  searchCities,
  type GeocodingResult,
  type TemperatureUnit,
  type WeatherReport,
} from './weatherService';

interface SelectedLocation {
  latitude: number;
  longitude: number;
  locationName: string;
}

const DEFAULT_CITY: SelectedLocation = {
  latitude: 51.5072,
  longitude: -0.1276,
  locationName: 'London, United Kingdom',
};

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === 'AbortError';
}

export function WeatherScreen() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 440;

  const [query, setQuery] = useState('');
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchEmptyMessage, setSearchEmptyMessage] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(DEFAULT_CITY);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [locationDeniedPermanently, setLocationDeniedPermanently] = useState(false);

  const activeRequestRef = useRef<AbortController | null>(null);

  const loadWeather = useCallback(
    async (target: SelectedLocation, mode: 'initial' | 'refresh' = 'initial') => {
      activeRequestRef.current?.abort();
      const controller = new AbortController();
      activeRequestRef.current = controller;

      setErrorMessage(null);
      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else {
        setIsLoadingWeather(true);
      }

      try {
        const nextReport = await fetchWeatherReport(target, controller.signal);
        setReport(nextReport);
      } catch (err: unknown) {
        if (isAbortError(err)) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Unable to fetch weather right now.';
        setErrorMessage(message);
      } finally {
        if (activeRequestRef.current === controller) {
          setIsLoadingWeather(false);
          setIsRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadWeather(selectedLocation, 'initial');
    return () => {
      activeRequestRef.current?.abort();
    };
  }, [selectedLocation, loadWeather]);

  const handleSearchSubmit = async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchEmptyMessage('Enter at least 2 characters to search for a city.');
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchEmptyMessage(null);
    setErrorMessage(null);

    try {
      const results = await searchCities(trimmed);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchEmptyMessage(`No cities matched "${trimmed}". Try another spelling.`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'City search failed.';
      setErrorMessage(message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = async (city: GeocodingResult) => {
    const displayName = city.admin1
      ? `${city.name}, ${city.admin1}, ${city.country}`
      : `${city.name}, ${city.country}`;

    setSearchResults([]);
    setSearchEmptyMessage(null);
    setQuery(city.name);
    setSelectedLocation({
      latitude: city.latitude,
      longitude: city.longitude,
      locationName: displayName,
    });

    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
  };

  const handleUseCurrentLocation = async () => {
    setErrorMessage(null);
    setLocationDeniedPermanently(false);
    setSearchResults([]);
    setSearchEmptyMessage(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationDeniedPermanently(!permission.canAskAgain);
        setErrorMessage(
          permission.canAskAgain
            ? 'Location access was denied. You can still search for any city above.'
            : 'Location access is disabled in system Settings.',
        );
        return;
      }

      setIsLoadingWeather(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setSelectedLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        locationName: 'Your Current Location',
      });
    } catch (err: unknown) {
      setIsLoadingWeather(false);
      const message =
        err instanceof Error ? err.message : 'Unable to determine your GPS location.';
      setErrorMessage(message);
    }
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  const currentDescription = report ? describeWeatherCode(report.current.weatherCode) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void loadWeather(selectedLocation, 'refresh');
            }}
            tintColor="#2563EB"
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Weather</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Switch temperature unit to degrees ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
            onPress={toggleUnit}
            style={({ pressed }) => [styles.unitPill, pressed && styles.pressed]}
          >
            <Text style={styles.unitPillText}>°{unit}</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => {
              void handleSearchSubmit();
            }}
            placeholder="Search city (e.g., Tokyo, Nairobi, Austin)"
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            style={styles.searchInput}
          />
          <Pressable
            accessibilityRole="button"
            disabled={isSearching}
            onPress={() => {
              void handleSearchSubmit();
            }}
            style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
          >
            <Text style={styles.searchButtonText}>{isSearching ? '...' : 'Search'}</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleUseCurrentLocation();
          }}
          style={({ pressed }) => [styles.locationButton, pressed && styles.pressed]}
        >
          <Text style={styles.locationButtonText}>Use My Current Location</Text>
        </Pressable>

        {searchEmptyMessage && <Text style={styles.emptySearchText}>{searchEmptyMessage}</Text>}

        {searchResults.length > 0 && (
          <View style={styles.resultsCard}>
            {searchResults.map((city) => (
              <Pressable
                key={city.id}
                accessibilityRole="button"
                onPress={() => {
                  void handleSelectCity(city);
                }}
                style={({ pressed }) => [styles.resultItem, pressed && styles.resultItemPressed]}
              >
                <Text style={styles.resultCity}>{city.name}</Text>
                <Text style={styles.resultSub}>
                  {city.admin1 ? `${city.admin1}, ${city.country}` : city.country}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {errorMessage && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <View style={styles.errorActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void loadWeather(selectedLocation, 'initial');
                }}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
              {locationDeniedPermanently && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void Linking.openSettings();
                  }}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.retryButtonText}>Open Settings</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {isLoadingWeather && !report ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Loading live forecast...</Text>
          </View>
        ) : report && currentDescription ? (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.locationName}>{report.locationName}</Text>
              <Text style={styles.heroSymbol}>{currentDescription.symbol}</Text>
              <Text style={styles.heroTemp}>
                {formatTemperature(report.current.temperatureC, unit)}
              </Text>
              <Text style={styles.heroCondition}>{currentDescription.label}</Text>
              <Text style={styles.heroUpdated}>Pull down to refresh</Text>
            </View>

            <View style={[styles.metricsGrid, isWideLayout && styles.metricsGridWide]}>
              <View style={[styles.metricTile, isWideLayout && styles.metricTileWide]}>
                <Text style={styles.metricLabel}>Feels Like</Text>
                <Text style={styles.metricValue}>
                  {formatTemperature(report.current.apparentTemperatureC, unit)}
                </Text>
              </View>
              <View style={[styles.metricTile, isWideLayout && styles.metricTileWide]}>
                <Text style={styles.metricLabel}>Humidity</Text>
                <Text style={styles.metricValue}>{Math.round(report.current.humidityPercent)}%</Text>
              </View>
              <View style={[styles.metricTile, isWideLayout && styles.metricTileWide]}>
                <Text style={styles.metricLabel}>Wind</Text>
                <Text style={styles.metricValue}>
                  {Math.round(report.current.windSpeedKmh)} km/h
                </Text>
              </View>
            </View>

            <View style={styles.forecastCard}>
              <Text style={styles.sectionTitle}>5-Day Forecast</Text>
              {report.daily.map((day) => {
                const desc = describeWeatherCode(day.weatherCode);
                return (
                  <View key={day.date} style={styles.forecastRow}>
                    <Text style={styles.forecastDate}>{day.date}</Text>
                    <Text style={styles.forecastDesc}>
                      {desc.symbol} {desc.label}
                    </Text>
                    <Text style={styles.forecastTemps}>
                      {formatTemperature(day.tempMaxC, unit)} /{' '}
                      {formatTemperature(day.tempMinC, unit)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: 20,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  unitPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  unitPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 15,
    color: '#0F172A',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  locationButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 14,
  },
  emptySearchText: {
    fontSize: 13,
    color: '#475569',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  resultItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultItemPressed: {
    backgroundColor: '#EFF6FF',
  },
  resultCity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  resultSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  retryButtonText: {
    color: '#991B1B',
    fontWeight: '600',
    fontSize: 13,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#475569',
  },
  heroCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  locationName: {
    color: '#DBEAFE',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroSymbol: {
    fontSize: 44,
    color: '#FFFFFF',
  },
  heroTemp: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroCondition: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EFF6FF',
  },
  heroUpdated: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricsGridWide: {
    flexWrap: 'nowrap',
  },
  metricTile: {
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  metricTileWide: {
    minWidth: 0,
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  forecastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  forecastDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    width: 92,
  },
  forecastDesc: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
  },
  forecastTemps: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  pressed: {
    opacity: 0.8,
  },
});
