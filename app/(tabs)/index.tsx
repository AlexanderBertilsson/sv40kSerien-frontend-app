import {  View, StyleSheet } from "react-native";
import { useState } from "react";
import ImageViewer from "@/components/ImageViewer";
import Button from "@/components/Button";
import * as ImagePicker from 'expo-image-picker';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if(!result.canceled) {
      setSelectedImage(result.assets[0].uri)
      setShowAppOptions(true);
    } else{
      alert('You did not select any image.')
    }
  }

  return (
    <View style={styles.contaier}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage}/>
      </View>
      {showAppOptions ? (
        <View/>
      ) : (
        <View style={styles.footerContainer}>
        <Button theme="primary" label="Choose a photo" onPress={pickImageAsync}/>
        <Button label="Use this photo" onPress={() => setShowAppOptions(true)}/>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contaier: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});
