import { Modal, View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageDropZone from '@/src/components/ImageDropZone';

interface UpdateTeamImagesModalProps {
  visible: boolean;
  onClose: () => void;
  currentLogo?: string;
  currentBanner?: string;
  onUpdate: (logoUri?: string, bannerUri?: string, imageMetadata?: any) => Promise<void>;
}

export default function UpdateTeamImagesModal({
  visible,
  onClose,
  currentLogo,
  currentBanner,
  onUpdate,
}: UpdateTeamImagesModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [logo, setLogo] = useState<string | null>(currentLogo || null);
  const [banner, setBanner] = useState<string | null>(currentBanner || null);
  const [isUploading, setIsUploading] = useState(false);

  const getImageMetadata = (uri: string) => {
    if (uri.startsWith('data:')) {
      const match = uri.match(/^data:image\/(\w+);base64,/);
      if (match) {
        const format = match[1];
        return { extension: format, contentType: `image/${format}` };
      }
    }
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    return { extension, contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}` };
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      const imageMetadata: any = {};

      if (logo) {
        const { extension, contentType } = getImageMetadata(logo);
        imageMetadata.logo = {
          fileName: `team-logo-${Date.now()}.${extension}`,
          contentType,
        };
      }

      if (banner) {
        const { extension, contentType } = getImageMetadata(banner);
        imageMetadata.banner = {
          fileName: `team-banner-${Date.now()}.${extension}`,
          contentType,
        };
      }

      await onUpdate(logo || undefined, banner || undefined, imageMetadata);
      onClose();
    } catch (error) {
      console.error('Failed to update team images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setLogo(currentLogo || null);
    setBanner(currentBanner || null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.icon }]}>
            <ThemedText style={styles.title}>Update Team Images</ThemedText>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {/* Banner Section */}
            <ImageDropZone
              imageUri={banner}
              onImageSelected={setBanner}
              onImageRemoved={() => setBanner(null)}
              label="Team Banner"
              aspectRatio={[16, 9]}
              width="100%"
              height={200}
              disabled={isUploading}
              theme={theme}
            />

            {/* Logo Section */}
            <ImageDropZone
              imageUri={logo}
              onImageSelected={setLogo}
              onImageRemoved={() => setLogo(null)}
              label="Team Logo"
              aspectRatio={[1, 1]}
              width={150}
              height={150}
              disabled={isUploading}
              theme={theme}
            />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.icon }]}>
            <Pressable
              style={[styles.button, { backgroundColor: theme.secondary }]}
              onPress={handleClose}
              disabled={isUploading}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.tint }]}
              onPress={handleSave}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>Save</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
