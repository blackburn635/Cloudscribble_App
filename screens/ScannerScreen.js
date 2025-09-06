// screens/ScannerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { AnchorGuideOverlay } from '../components/AnchorGuideOverlay';
import { processImage } from '../utils/imageProcessor';

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    // Request camera permissions when component mounts
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);
    try {
      // Take the picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: true, // We'll do our own processing
      });

      // Process the image to detect anchors and transform
      const processedResult = await processImage(photo.uri);

      // Navigate to results screen with the processed image
      navigation.navigate('Result', { 
        imageUri: processedResult.uri,
        detectedAnchors: processedResult.anchors
      });
    } catch (error) {
      Alert.alert(
        'Scanning Error',
        'Could not detect anchor marks clearly. Please ensure good lighting and that anchor marks are visible.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return <View />; // Still loading
  }

  if (hasPermission === false) {
    return Alert.alert('Error', 'No access to camera');
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        autoFocus={Camera.Constants.AutoFocus.on}
      >
        <AnchorGuideOverlay />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              isProcessing && styles.buttonDisabled
            ]}
            onPress={handleCapture}
            disabled={isProcessing}
          >
            <View style={styles.buttonInner} />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dedede',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});