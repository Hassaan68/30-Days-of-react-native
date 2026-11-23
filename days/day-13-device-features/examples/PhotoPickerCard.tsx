import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export interface PhotoPickerCardProps {
  onPhotoSelected?: (uri: string) => void;
}

export function PhotoPickerCard({ onPhotoSelected }: PhotoPickerCardProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permissionNotice, setPermissionNotice] = useState<{
    message: string;
    canOpenSettings: boolean;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const handlePickFromLibrary = async () => {
    setPermissionNotice(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionNotice({
        message: permission.canAskAgain
          ? 'Photo library access is needed so you can choose a profile photo.'
          : 'Photo library access is disabled. Enable it in Settings to pick a photo.',
        canOpenSettings: !permission.canAskAgain,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const firstAsset = result.assets[0];
    if (!firstAsset) {
      return;
    }

    setPhotoUri(firstAsset.uri);
    onPhotoSelected?.(firstAsset.uri);
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleOpenCamera = async () => {
    setPermissionNotice(null);

    if (cameraPermission?.granted) {
      setIsCameraOpen(true);
      return;
    }

    const response = await requestCameraPermission();
    if (!response.granted) {
      setPermissionNotice({
        message: response.canAskAgain
          ? 'Camera access is needed to take a new photo.'
          : 'Camera permission was permanently denied. Enable it in Settings.',
        canOpenSettings: !response.canAskAgain,
      });
      return;
    }

    setIsCameraOpen(true);
  };

  const handleCapturePhoto = async () => {
    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.75 });
    if (!picture) {
      return;
    }

    setPhotoUri(picture.uri);
    setIsCameraOpen(false);
    onPhotoSelected?.(picture.uri);
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  if (isCameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        <View style={styles.cameraControls}>
          <Pressable
            accessibilityRole="button"
            onPress={toggleFacing}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Flip</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void handleCapturePhoto();
            }}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Capture</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsCameraOpen(false)}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Profile Photo</Text>
      <Text style={styles.subtitle}>
        Choose an existing image from your library or capture a new one with expo-camera.
      </Text>

      <View style={styles.previewBox}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.previewImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Text style={styles.placeholderText}>No photo selected yet</Text>
        )}
      </View>

      {permissionNotice && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>{permissionNotice.message}</Text>
          {permissionNotice.canOpenSettings && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void Linking.openSettings();
              }}
              style={({ pressed }) => [styles.settingsLink, pressed && styles.pressed]}
            >
              <Text style={styles.settingsLinkText}>Open Settings</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.actionRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handlePickFromLibrary();
          }}
          style={({ pressed }) => [styles.primaryButton, styles.flexButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Choose Photo</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleOpenCamera();
          }}
          style={({ pressed }) => [
            styles.secondaryButton,
            styles.flexButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Open Camera</Text>
        </Pressable>
      </View>
    </View>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  previewBox: {
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 14,
  },
  noticeBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  noticeText: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 18,
  },
  settingsLink: {
    alignSelf: 'flex-start',
  },
  settingsLinkText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  camera: {
    height: 360,
    width: '100%',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#0F172A',
    gap: 10,
  },
  pressed: {
    opacity: 0.82,
  },
});
