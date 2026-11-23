import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CardContainerProps {
  highlighted?: boolean;
}

export function CardContainer({
  highlighted = false,
  children,
}: PropsWithChildren<CardContainerProps>) {
  return <View style={[styles.card, highlighted && styles.cardHighlighted]}>{children}</View>;
}

interface SkillTagProps {
  label: string;
}

function SkillTag({ label }: SkillTagProps) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export interface ProfileCardProps {
  name: string;
  role: string;
  bio?: string;
  skills: readonly string[];
  initialFollowers?: number;
}

export function ProfileCard({
  name,
  role,
  bio,
  skills,
  initialFollowers = 0,
}: ProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Derived state: no need for a second `followerCount` useState.
  const followerCount = initialFollowers + (isFollowing ? 1 : 0);

  const initials = name
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <CardContainer highlighted={isFollowing}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials || '?'}</Text>
        </View>
        <View style={styles.identity}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>

      {bio !== undefined && bio.trim().length > 0 && <Text style={styles.bio}>{bio}</Text>}

      {skills.length > 0 && (
        <View style={styles.skillsRow}>
          {skills.map((skill) => (
            <SkillTag key={skill} label={skill} />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.followers}>
          {followerCount} {followerCount === 1 ? 'Follower' : 'Followers'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFollowing ? `Unfollow ${name}` : `Follow ${name}`}
          onPress={() => setIsFollowing((prev) => !prev)}
          style={({ pressed }) => [
            styles.followButton,
            isFollowing && styles.followingButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardHighlighted: {
    borderColor: '#2563EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  identity: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  role: {
    fontSize: 14,
    color: '#64748B',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  followers: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  followButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  followingButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#1D4ED8',
  },
});

export default ProfileCard;
