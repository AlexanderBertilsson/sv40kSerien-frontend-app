import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Image, Platform, DimensionValue } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface ImageDropZoneProps {
  imageUri: string | null;
  // eslint-disable @typescript-eslint/no-unused-vars
  onImageSelected: (imageUri: string) => void;
  onImageRemoved?: () => void;
  label?: string;
  aspectRatio?: [number, number];
  width?: DimensionValue;
  height?: number;
  disabled?: boolean;
  theme: {
    text: string;
    tint: string;
    secondary: string;
  };
}

export default function ImageDropZone({
  imageUri,
  onImageSelected,
  onImageRemoved,
  label,
  aspectRatio = [1, 1],
  width = 150,
  height = 150,
  disabled = false,
  theme,
}: ImageDropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      Alert.alert('Error', 'Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const uri = e.target?.result as string;
      onImageSelected(uri);
    };
    reader.readAsDataURL(file);
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // Use native file input on web
      inputRef.current?.click();
    } else {
      // Use expo-image-picker on native
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: aspectRatio,
          quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
          onImageSelected(result.assets[0].uri);
        }
      } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent | any) => {
    e.stopPropagation();
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  // Web-specific rendering
  if (Platform.OS === 'web') {
    // Convert width to CSS-compatible value for web
    const cssWidth: string | number = typeof width === 'number' ? `${width}px` : (width as string || '100%');
    const shouldCenter = typeof width === 'number' && width < 300;

    return (
      <View style={styles.container}>
        {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
        <input
          ref={inputRef as any}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && pickImage()}
          style={{
            height,
            width: cssWidth,
            borderWidth: dragActive ? 3 : 2,
            borderStyle: 'dashed',
            borderColor: theme.tint,
            borderRadius: 8,
            backgroundColor: dragActive ? theme.tint + '20' : theme.secondary,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            alignSelf: shouldCenter ? 'center' : undefined,
          }}
        >
          {imageUri ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={imageUri}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 6,
                  objectFit: 'cover',
                }}
                alt="Preview"
              />
              {onImageRemoved && (
                <button
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                  }}
                >
                  <Ionicons name="close" size={18} color="white" />
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="image-outline" size={40} color={theme.text} />
              <Text style={[styles.pickerText, { color: theme.text }]}>
                Click or Drag & Drop
              </Text>
            </div>
          )}
        </div>
      </View>
    );
  }

  // Native rendering
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
      <Pressable
        style={[
          styles.picker,
          {
            backgroundColor: theme.secondary,
            borderColor: theme.tint,
            width,
            height,
            alignSelf: typeof width === 'number' && width < 300 ? 'center' : undefined,
          },
        ]}
        onPress={pickImage}
        disabled={disabled}
      >
        {imageUri ? (
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            {onImageRemoved && (
              <Pressable
                onPress={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color="white" />
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.pickerContent}>
            <Ionicons name="image-outline" size={40} color={theme.text} />
            <Text style={[styles.pickerText, { color: theme.text }]}>
              Select Image
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  picker: {
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    marginTop: 8,
    fontSize: 14,
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
});
