import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthProvider';
import { maskTokenPreview } from '../services/secureTokenService';
import { isAccessTokenExpired } from '../types/auth';

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  const first = parts[0]?.[0] ?? 'U';
  const second = parts[1]?.[0] ?? '';
  return `${first}${second}`.toUpperCase();
}

function formatExpiration(expiresAt: number): string {
  const remainingMinutes = Math.max(0, Math.round((expiresAt - Date.now()) / 60_000));
  if (remainingMinutes === 0) {
    return 'Expiring soon';
  }
  return `Expires in ~${remainingMinutes} min`;
}

export function AccountScreen() {
  const { status, session, user, isSubmitting, refreshSession, signOut } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (status === 'hydrating') {
    return (
      <SafeAreaView style={styles.centeredContainer} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Restoring secure session…</Text>
      </SafeAreaView>
    );
  }

  if (!session || !user) {
    return (
      <SafeAreaView style={styles.centeredContainer} edges={['top', 'bottom']}>
        <Text style={styles.emptyTitle}>No active session</Text>
        <Text style={styles.emptySubtitle}>
          Sign in from the authentication screen to view your protected account details.
        </Text>
      </SafeAreaView>
    );
  }

  const expired = isAccessTokenExpired(session.tokens);

  const handleRotateToken = async (): Promise<void> => {
    setFeedback(null);
    const ok = await refreshSession();
    if (ok) {
      setFeedback('Access and refresh tokens were rotated and saved to SecureStore.');
    }
  };

  const handleConfirmSignOut = (): void => {
    Alert.alert('Sign Out', 'Remove stored tokens from this device and end your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle} accessibilityRole="header">
          Account & Session
        </Text>

        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar} accessible={false}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{user.role.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session Security</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Storage Backend</Text>
            <Text style={styles.detailValue}>expo-secure-store (Keychain / Keystore)</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Access Token (Masked)</Text>
            <Text style={styles.detailValueMono}>
              {maskTokenPreview(session.tokens.accessToken)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Token Status</Text>
            <Text style={[styles.detailValue, expired ? styles.statusWarning : styles.statusOk]}>
              {expired ? 'Refresh Required' : formatExpiration(session.tokens.expiresAt)}
            </Text>
          </View>
        </View>

        {feedback ? (
          <View style={styles.feedbackBanner} accessibilityLiveRegion="polite">
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              void handleRotateToken();
            }}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && !isSubmitting ? styles.secondaryButtonPressed : undefined,
              isSubmitting ? styles.disabledButton : undefined,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Rotate access token"
            accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
          >
            <Text style={styles.secondaryButtonText}>
              {isSubmitting ? 'Updating Session…' : 'Rotate Access Token'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleConfirmSignOut}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.dangerButton,
              pressed && !isSubmitting ? styles.dangerButtonPressed : undefined,
              isSubmitting ? styles.disabledButton : undefined,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            accessibilityState={{ disabled: isSubmitting }}
          >
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: '#475569',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 14,
    color: '#475569',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: '#1E293B',
  },
  detailValueMono: {
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Courier',
  },
  statusOk: {
    color: '#15803D',
    fontWeight: '600',
  },
  statusWarning: {
    color: '#B45309',
    fontWeight: '600',
  },
  feedbackBanner: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  feedbackText: {
    color: '#166534',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#F1F5F9',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonPressed: {
    backgroundColor: '#B91C1C',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
