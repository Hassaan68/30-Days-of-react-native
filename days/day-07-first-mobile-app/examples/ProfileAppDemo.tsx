import { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type ScreenTab = 'profile' | 'about';
type ThemeMode = 'light' | 'dark';

interface Palette {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  successBg: string;
  successText: string;
}

const LIGHT_PALETTE: Palette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F5F9',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  successBg: '#DCFCE7',
  successText: '#15803D',
};

const DARK_PALETTE: Palette = {
  background: '#0B1120',
  surface: '#111827',
  surfaceMuted: '#1E293B',
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: '#60A5FA',
  primaryText: '#0B1120',
  successBg: '#14532D',
  successText: '#86EFAC',
};

function getCardShadow(mode: ThemeMode): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: mode === 'dark' ? 0.35 : 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: mode === 'dark' ? 5 : 2,
      },
      default: {},
    }) ?? {}
  );
}

interface AvatarProps {
  name: string;
  imageUrl: string;
  size?: number;
  palette: Palette;
}

export function Avatar({ name, imageUrl, size = 84, palette }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (imageFailed) {
    return (
      <View
        style={[
          styles.avatarFallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: palette.primary,
          },
        ]}
        accessibilityLabel={`${name} avatar`}
      >
        <Text style={[styles.avatarInitials, { color: palette.primaryText }]}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      onError={() => setImageFailed(true)}
      style={[
        styles.avatarImage,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: palette.border,
          backgroundColor: palette.surfaceMuted,
        },
      ]}
      accessibilityLabel={`${name} profile photo`}
    />
  );
}

interface StatItemProps {
  label: string;
  value: string;
  palette: Palette;
}

export function StatItem({ label, value, palette }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: palette.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: palette.textMuted }]}>{label}</Text>
    </View>
  );
}

interface SkillTagProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  palette: Palette;
}

export function SkillTag({ label, selected, onPress, palette }: SkillTagProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.skillTag,
        {
          backgroundColor: selected ? palette.primary : palette.surfaceMuted,
          borderColor: selected ? palette.primary : palette.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.skillTagText,
          { color: selected ? palette.primaryText : palette.textSecondary },
        ]}
      >
        {selected ? `${label} ✓` : label}
      </Text>
    </Pressable>
  );
}

interface ActionButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
  palette: Palette;
}

export function ActionButton({
  label,
  variant = 'primary',
  onPress,
  palette,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: isPrimary ? palette.primary : palette.surfaceMuted,
          borderColor: isPrimary ? palette.primary : palette.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          { color: isPrimary ? palette.primaryText : palette.textPrimary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const DEVELOPER_SKILLS = [
  'React Native',
  'TypeScript',
  'Expo SDK 58',
  'Flexbox',
  'UI Architecture',
  'Accessibility',
] as const;

interface TimelineEntry {
  id: string;
  year: string;
  role: string;
  summary: string;
}

const EXPERIENCE_TIMELINE: readonly TimelineEntry[] = [
  {
    id: 'exp-1',
    year: '2025 – Present',
    role: 'Senior Mobile Engineer • Open Source',
    summary: 'Building cross-platform Expo apps, reusable design systems, and developer tutorials.',
  },
  {
    id: 'exp-2',
    year: '2022 – 2025',
    role: 'React Native Developer • FinTech',
    summary: 'Shipped iOS & Android banking experiences to 500k+ monthly active users.',
  },
];

function ProfileAppContent() {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<ThemeMode | null>(null);
  const [activeTab, setActiveTab] = useState<ScreenTab>('profile');
  const [isFollowing, setIsFollowing] = useState(false);
  const [endorsedSkills, setEndorsedSkills] = useState<string[]>(['React Native', 'TypeScript']);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const mode: ThemeMode = themeOverride ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const palette = mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
  const shadow = getCardShadow(mode);

  const followerCount = isFollowing ? 1285 : 1284;

  const toggleSkillEndorsement = (skill: string) => {
    setEndorsedSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill],
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={[styles.topBar, { borderBottomColor: palette.border }]}>
        <Text style={[styles.topBarTitle, { color: palette.textPrimary }]}>
          {activeTab === 'profile' ? 'Developer Profile' : 'About & Experience'}
        </Text>
        <Pressable
          onPress={() => setThemeOverride(mode === 'dark' ? 'light' : 'dark')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Toggle color theme"
          style={({ pressed }) => [
            styles.themeToggle,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Text style={[styles.themeToggleText, { color: palette.textPrimary }]}>
            {mode === 'dark' ? 'Light' : 'Dark'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'profile' ? (
          <>
            <View
              style={[
                styles.card,
                shadow,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <View style={styles.profileHeader}>
                <Avatar
                  name="Maya Lin"
                  imageUrl="https://reactnative.dev/img/tiny_logo.png"
                  palette={palette}
                />
                <View style={styles.profileIdentity}>
                  <View style={[styles.availabilityPill, { backgroundColor: palette.successBg }]}>
                    <Text style={[styles.availabilityText, { color: palette.successText }]}>
                      Open to Collaborate
                    </Text>
                  </View>
                  <Text style={[styles.name, { color: palette.textPrimary }]}>Maya Lin</Text>
                  <Text style={[styles.role, { color: palette.textSecondary }]}>
                    React Native &amp; Expo Engineer
                  </Text>
                  <Text style={[styles.location, { color: palette.textMuted }]}>
                    Toronto, Canada • UTC-5
                  </Text>
                </View>
              </View>

              <Text style={[styles.bio, { color: palette.textSecondary }]}>
                Crafting accessible, high-framerate iOS and Android apps with React Native,
                TypeScript, and Expo. Documenting every step of the 30-day journey.
              </Text>

              <View style={styles.actionsRow}>
                <ActionButton
                  label={isFollowing ? 'Following ✓' : 'Follow'}
                  variant={isFollowing ? 'secondary' : 'primary'}
                  onPress={() => setIsFollowing((prev) => !prev)}
                  palette={palette}
                />
                <ActionButton
                  label="Contact"
                  variant="secondary"
                  onPress={() => setIsContactOpen(true)}
                  palette={palette}
                />
              </View>
            </View>

            <View
              style={[
                styles.statsCard,
                shadow,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <StatItem label="Apps Shipped" value="14" palette={palette} />
              <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
              <StatItem label="Followers" value={followerCount.toLocaleString()} palette={palette} />
              <View style={[styles.statDivider, { backgroundColor: palette.border }]} />
              <StatItem label="Endorsed" value={String(endorsedSkills.length)} palette={palette} />
            </View>

            <View
              style={[
                styles.card,
                shadow,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Core Skills (Tap to Endorse)
              </Text>
              <View style={styles.skillsWrap}>
                {DEVELOPER_SKILLS.map((skill) => (
                  <SkillTag
                    key={skill}
                    label={skill}
                    selected={endorsedSkills.includes(skill)}
                    onPress={() => toggleSkillEndorsement(skill)}
                    palette={palette}
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <View
              style={[
                styles.card,
                shadow,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                About This App
              </Text>
              <Text style={[styles.bio, { color: palette.textSecondary }]}>
                This Week 1 Capstone combines reusable components, Flexbox layouts, safe areas,
                light/dark themes, and state-driven screen switching. Tomorrow on Day 08, you will
                upgrade manual screen switching to file-based navigation with Expo Router.
              </Text>
            </View>

            <View
              style={[
                styles.card,
                shadow,
                { backgroundColor: palette.surface, borderColor: palette.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Experience</Text>
              <View style={styles.timelineList}>
                {EXPERIENCE_TIMELINE.map((entry) => (
                  <View
                    key={entry.id}
                    style={[styles.timelineItem, { borderLeftColor: palette.primary }]}
                  >
                    <Text style={[styles.timelineYear, { color: palette.primary }]}>
                      {entry.year}
                    </Text>
                    <Text style={[styles.timelineRole, { color: palette.textPrimary }]}>
                      {entry.role}
                    </Text>
                    <Text style={[styles.timelineSummary, { color: palette.textSecondary }]}>
                      {entry.summary}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomTabs,
          { backgroundColor: palette.surface, borderTopColor: palette.border },
        ]}
      >
        {(['profile', 'about'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.tabButton,
                isActive && { backgroundColor: palette.surfaceMuted },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  { color: isActive ? palette.primary : palette.textMuted },
                ]}
              >
                {tab === 'profile' ? 'Profile' : 'About'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Modal
        visible={isContactOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsContactOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Connect with Maya
            </Text>
            <Text style={[styles.bio, { color: palette.textSecondary }]}>
              Email: maya.lin@example.dev{'\n'}GitHub: @mayalin-rn
            </Text>
            <ActionButton
              label="Done"
              variant="primary"
              onPress={() => setIsContactOpen(false)}
              palette={palette}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function ProfileAppDemo() {
  return (
    <SafeAreaProvider>
      <ProfileAppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  themeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarImage: {
    borderWidth: 2,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileIdentity: {
    flex: 1,
    gap: 4,
  },
  availabilityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    fontSize: 13,
  },
  bio: {
    fontSize: 14,
    lineHeight: 21,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  skillTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timelineList: {
    gap: 14,
  },
  timelineItem: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    gap: 3,
  },
  timelineYear: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineRole: {
    fontSize: 15,
    fontWeight: '700',
  },
  timelineSummary: {
    fontSize: 13,
    lineHeight: 19,
  },
  bottomTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
});
