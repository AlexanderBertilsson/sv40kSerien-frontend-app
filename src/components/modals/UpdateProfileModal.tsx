import { Modal, View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageDropZone from '@/src/components/ImageDropZone';

interface UpdateProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentProfilePicture?: string;
  currentHeroImage?: string;
  onUpdate: (profilePictureUri?: string, heroImageUri?: string, imageMetadata?: any) => Promise<void>;
}

export default function UpdateProfileModal({
  visible,
  onClose,
  currentProfilePicture,
  currentHeroImage,
  onUpdate,
}: UpdateProfileModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [profilePicture, setProfilePicture] = useState<string | null>(currentProfilePicture || null);
  const [heroImage, setHeroImage] = useState<string | null>(currentHeroImage || null);
  const [isUploading, setIsUploading] = useState(false);

  const getImageMetadata = (uri: string) => {
    // Check if it's a data URL (base64)
    if (uri.startsWith('data:')) {
      const match = uri.match(/^data:image\/(\w+);base64,/);
      if (match) {
        const format = match[1];
        return {
          extension: format,
          contentType: `image/${format}`,
        };
      }
    }
    
    // Fallback: try to extract from file extension
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';
    return {
      extension,
      contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    };
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      // Prepare image metadata for backend
      const imageMetadata: any = {};
      
      if (profilePicture) {
        const { extension, contentType } = getImageMetadata(profilePicture);
        imageMetadata.profilePicture = {
          fileName: `profile-picture-${Date.now()}.${extension}`,
          contentType,
        };
      }

      if (heroImage) {
        const { extension, contentType } = getImageMetadata(heroImage);
        imageMetadata.heroImage = {
          fileName: `profile-hero-image-${Date.now()}.${extension}`,
          contentType,
        };
      }

      await onUpdate(profilePicture || undefined, heroImage || undefined, imageMetadata);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setProfilePicture(currentProfilePicture || null);
    setHeroImage(currentHeroImage || null);
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
            <ThemedText style={styles.title}>Update Profile</ThemedText>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {/* Hero Image Section */}
            <ImageDropZone
              imageUri={heroImage}
              onImageSelected={setHeroImage}
              onImageRemoved={() => setHeroImage(null)}
              label="Hero Image"
              aspectRatio={[16, 9]}
              width="100%"
              height={200}
              theme={theme}
            />

            {/* Profile Picture Section */}
            <ImageDropZone
              imageUri={profilePicture}
              onImageSelected={setProfilePicture}
              onImageRemoved={() => setProfilePicture(null)}
              label="Profile Picture"
              aspectRatio={[1, 1]}
              width={150}
              height={150}
              theme={theme}
            />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.icon }]}>
            <Pressable
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.secondary }]}
              onPress={handleClose}
              disabled={isUploading}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton, { backgroundColor: theme.tint }]}
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
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
