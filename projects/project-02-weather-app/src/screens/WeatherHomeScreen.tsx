import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeatherCard } from '../components/WeatherCard';
import {
  fetchWeatherByCoordinates,
  PRESET_CITIES,
  searchCities,
} from '../services/openMeteo';
import type {
  CityLocation,
  Coordinates,
  TemperatureUnit,
  WeatherReport,
} from '../types/weather';

interface ActiveSelection {
  readonly name: string;
  readonly country?: string;
  readonly coordinates: Coordinates;
}

const DEFAULT_CITY = PRESET_CITIES[0];

const FALLBACK_SELECTION: ActiveSelection = DEFAULT_CITY
  ? {
      name: DEFAULT_CITY.name,
      country: DEFAULT_CITY.country,
      coordinates: DEFAULT_CITY.coordinates,
    }
  : {
      name: 'Tokyo',
      country: 'Japan',
      coordinates: { latitude: 35.6762, longitude: 139.6503 },
    };

export function WeatherHomeScreen(): React.JSX.Element {
  const [selection, setSelection] = useState<ActiveSelection>(FALLBACK_SELECTION);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<readonly CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadWeather = useCallback(
    async (
      target: ActiveSelection,
      options?: { isPullToRefresh?: boolean; signal?: AbortSignal },
    ): Promise<void> => {
      if (options?.isPullToRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const nextReport = await fetchWeatherByCoordinates(
          target.coordinates,
          target.name,
          target.country,
          options?.signal,
        );
        setReport(nextReport);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load weather data. Please check your connection.';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadWeather(selection, { signal: controller.signal });
    return () => {
      controller.abort();
    };
  }, [selection, loadWeather]);

  const handleSearchSubmit = async (): Promise<void> => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    try {
      const matches = await searchCities(trimmed);
      setSearchResults(matches);
      if (matches.length === 0) {
        setErrorMessage(`No cities matched "${trimmed}". Try another search.`);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to search cities.';
      setErrorMessage(message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = (city: CityLocation): void => {
    setSelection({
      name: city.name,
      country: city.admin1 ? `${city.admin1}, ${city.country}` : city.country,
      coordinates: city.coordinates,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUseCurrentLocation = async (): Promise<void> => {
    setIsLocating(true);
    setErrorMessage(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setErrorMessage(
          'Location permission was denied. Enable it in Settings or search for a city below.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setSelection({
        name: 'Current Location',
        country: 'GPS Forecast',
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
      setSearchResults([]);
    } catch {
      setErrorMessage(
        'Could not read device GPS. Select a city manually or try again.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void loadWeather(selection, { isPullToRefresh: true });
            }}
          />
        }
      >
        {/* Top Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Weather</Text>
            <Text style={styles.subtitle}>Powered by Open-Meteo</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() =>
                setUnit((prev) =>
                  prev === 'celsius' ? 'fahrenheit' : 'celsius',
                )
              }
              accessibilityRole="button"
              accessibilityLabel={`Switch temperature unit to ${
                unit === 'celsius' ? 'Fahrenheit' : 'Celsius'
              }`}
              style={({ pressed }) => [
                styles.unitButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.unitButtonText}>
                {unit === 'celsius' ? '°C' : '°F'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                void handleUseCurrentLocation();
              }}
              disabled={isLocating}
              accessibilityRole="button"
              accessibilityLabel="Use my current GPS location"
              style={({ pressed }) => [
                styles.gpsButton,
                isLocating && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.gpsButtonText}>
                {isLocating ? 'Locating…' : 'Use GPS'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* City Search Bar */}
        <View style={styles.searchRow}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              void handleSearchSubmit();
            }}
            placeholder="Search any city (e.g., Seoul, Lisbon)…"
            placeholderTextColor="#94A3B8"
            returnKeyType="search"
            style={styles.searchInput}
            accessibilityLabel="City search input"
          />
          <Pressable
            onPress={() => {
              void handleSearchSubmit();
            }}
            disabled={isSearching}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.searchButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? '…' : 'Search'}
            </Text>
          </Pressable>
        </View>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.resultsCard}>
            {searchResults.map((city) => (
              <Pressable
                key={city.id}
                onPress={() => handleSelectCity(city)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.resultItem,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.resultTitle}>{city.name}</Text>
                <Text style={styles.resultMeta}>
                  {city.admin1 ? `${city.admin1}, ${city.country}` : city.country}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Quick Preset Cities */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsRow}
        >
          {PRESET_CITIES.map((city) => {
            const isActive = selection.name === city.name;
            return (
              <Pressable
                key={city.id}
                onPress={() => handleSelectCity(city)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.presetChip,
                  isActive && styles.presetChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    isActive && styles.presetChipTextActive,
                  ]}
                >
                  {city.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Error Banner */}
        {errorMessage !== null && (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable
              onPress={() => {
                void loadWeather(selection);
              }}
              accessibilityRole="button"
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Main Weather Content */}
        {isLoading && report === null ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Fetching live forecast…</Text>
          </View>
        ) : report !== null ? (
          <WeatherCard report={report} unit={unit} />
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
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  gpsButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  gpsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.78,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  searchButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  resultItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  resultMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  presetsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingState: {
    paddingVertical: 64,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
});
