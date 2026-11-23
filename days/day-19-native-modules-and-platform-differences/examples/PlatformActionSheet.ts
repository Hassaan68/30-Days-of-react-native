import { ActionSheetIOS, Alert, Platform, type AlertButton, type ViewStyle } from 'react-native';

export interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export interface PlatformActionSheetConfig {
  title: string;
  message?: string;
  cancelLabel?: string;
  options: readonly ActionSheetOption[];
}

/**
 * Displays a native iOS ActionSheet on iOS and a Material-style Alert dialog
 * on Android and other platforms.
 */
export function showPlatformActionSheet(config: PlatformActionSheetConfig): void {
  const cancelLabel = config.cancelLabel ?? 'Cancel';

  if (Platform.OS === 'ios') {
    const labels = [...config.options.map((option) => option.label), cancelLabel];
    const cancelButtonIndex = labels.length - 1;
    const destructiveIndex = config.options.findIndex((option) => option.destructive === true);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: config.title,
        message: config.message,
        options: labels,
        cancelButtonIndex,
        destructiveButtonIndex: destructiveIndex >= 0 ? destructiveIndex : undefined,
      },
      (selectedIndex: number) => {
        if (selectedIndex === cancelButtonIndex) {
          return;
        }
        const chosen = config.options[selectedIndex];
        if (chosen) {
          chosen.onPress();
        }
      },
    );
    return;
  }

  const buttons: AlertButton[] = [
    ...config.options.map(
      (option): AlertButton => ({
        text: option.label,
        style: option.destructive ? 'destructive' : 'default',
        onPress: option.onPress,
      }),
    ),
    {
      text: cancelLabel,
      style: 'cancel',
    },
  ];

  Alert.alert(config.title, config.message, buttons, { cancelable: true });
}

export type ElevationLevel = 'sm' | 'md' | 'lg';

/**
 * Returns platform-idiomatic surface depth styles:
 * subtle layered shadows on iOS and Material elevation on Android.
 */
export function getPlatformShadow(level: ElevationLevel): ViewStyle {
  const shadowPresets: Record<ElevationLevel, { ios: ViewStyle; android: ViewStyle }> = {
    sm: {
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    },
    md: {
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    },
    lg: {
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    },
  };

  const preset = shadowPresets[level];

  return Platform.select<ViewStyle>({
    ios: preset.ios,
    android: preset.android,
    default: preset.ios,
  });
}
