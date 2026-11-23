import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { findPlaygroundEntry } from '../../src/playground/exampleRegistry';

export default function PreviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const entry = findPlaygroundEntry(id);

  if (!entry) {
    return (
      <View style={styles.notFound}>
        <Stack.Screen options={{ title: 'Example Not Found' }} />
        <Text style={styles.notFoundTitle}>Preview not found</Text>
        <Text style={styles.notFoundBody}>
          Return to the launcher to pick an interactive lesson example or featured project.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${entry.badge}: ${entry.title}` }} />
      <View style={styles.sourceBar}>
        <Text style={styles.sourceLabel} numberOfLines={1}>
          Source: {entry.sourcePath}
        </Text>
      </View>
      <View style={styles.content}>{entry.render()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  sourceBar: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sourceLabel: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  notFoundBody: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
  },
});
