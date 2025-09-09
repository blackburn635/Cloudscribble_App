// components/PlannerCamera.js
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const PlannerCamera = ({ onPhotoCapture }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Calculate height to maintain 8.5:11 aspect ratio
  const screenWidth = Dimensions.get('window').width;
  const height = (screenWidth * 11) / 8.5; // Aspect ratio for single page
  
  // Calculate QR detection box size (1/8 of frame width, squared)
  const qrBoxSize = screenWidth / 8;

  const cameraRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isCameraReady && cameraRef.current) {
        console.log('Setting camera ready via timeout');
        setIsCameraReady(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getNativeCamera = useCallback(() => {
    if (!cameraRef.current) return null;
    return cameraRef.current._cameraRef?.current;
  }, []);

  const handleCapture = async () => {
    console.log('Capture button pressed');
    
    if (isCapturing) {
      console.log('Already capturing');
      return;
    }

    try {
      setIsCapturing(true);
      console.log('Starting capture process');

      const nativeCamera = getNativeCamera();
      console.log('Native camera obtained:', !!nativeCamera);

      if (!nativeCamera) {
        throw new Error('Cannot access camera');
      }

      console.log('Taking picture...');
      const photo = await nativeCamera.takePicture({
        quality: 0.8,
        skipProcessing: Platform.OS === 'android'
      });

      console.log('Photo captured:', photo);
      
      if (photo?.uri) {
        onPhotoCapture(photo.uri);
      } else {
        throw new Error('No photo URI received');
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert(
        'Capture Error',
        'Failed to take photo. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.permissionText}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Camera permission required</Text>
        <Text style={styles.permissionSubText}>
          Please enable camera access to use this feature.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        onInitialized={() => {
          console.log('Camera initialized');
          setIsCameraReady(true);
        }}
        onError={(error) => {
          console.error('Camera error:', error);
        }}
        enableHighQualityPhotos={true}
        photo={true}
      >
        <View style={styles.overlay}>
          {/* Guide overlay for 8.5x11 page */}
          <View style={styles.pageGuide}>
            {/* Header region guide */}
            <View style={styles.headerGuide} />
            {/* Content regions guide */}
            <View style={styles.contentGuide}>
              <View style={styles.eventsColumn} />
              <View style={styles.todosColumn} />
            </View>
          </View>
          
          {/* QR Code Detection Box - Bottom Center */}
          <View 
            style={[
              styles.qrDetectionBox, 
              { 
                width: qrBoxSize, 
                height: qrBoxSize,
                left: (screenWidth - qrBoxSize) / 2, // Center horizontally
              }
            ]} 
          />
          
          <TouchableOpacity
            style={[styles.captureButton, !isCameraReady && styles.buttonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pageGuide: {
    position: 'absolute',
    top: '4%',
    left: '4%',
    right: '4%',
    bottom: '4%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerGuide: {
    height: '10%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  contentGuide: {
    flex: 1,
    flexDirection: 'row',
  },
  eventsColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
  },
  todosColumn: {
    flex: 1,
  },
  qrDetectionBox: {
    position: 'absolute',
    bottom: '8%', // Position at bottom with some margin
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  captureButton: {
    position: 'absolute',
    right: '5%',
    top: '50%',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -35 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  permissionSubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default PlannerCamera;