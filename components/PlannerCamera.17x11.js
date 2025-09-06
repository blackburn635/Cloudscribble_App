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
  
  const screenWidth = Dimensions.get('window').width;
  const height = (screenWidth * 11) / 17;
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

    const camera = cameraRef.current;
    if (camera._cameraRef?.current) {
      return camera._cameraRef.current;
    }
    return null;
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
          <View style={[styles.anchorGuide, styles.topLeft]} />
          <View style={[styles.anchorGuide, styles.bottomRight]} />
          <View style={styles.pageGuide} />
          
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
  anchorGuide: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
  },
  topLeft: {
    top: '5%',
    left: '5%',
  },
  bottomRight: {
    bottom: '5%',
    right: '5%',
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