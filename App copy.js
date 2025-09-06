import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Button, 
  Image,
  SafeAreaView,
  Dimensions,
  Alert 
} from 'react-native';
import PlannerCamera from './components/PlannerCamera';

export default function App() {
  // State management for both debugging and camera features
  const [testCounter, setTestCounter] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // This useEffect runs when the component first loads
  useEffect(() => {
    console.log('App is starting up...');
    console.log('Testing environment setup:', {
      screenDimensions: Dimensions.get('window'),
      timestamp: new Date().toISOString()
    });
  }, []);

  // Original debugging functions
  const testErrorHandling = () => {
    try {
      const result = testCounter.nonexistentMethod();
    } catch (error) {
      console.error('Caught test error:', error.message);
      Alert.alert('Error Caught', 'Successfully caught and logged a test error');
    }
  };

  const testAsyncOperation = async () => {
    console.log('Starting async operation...');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Async operation completed successfully');
      setTestCounter(prev => prev + 1);
    } catch (error) {
      console.error('Async operation failed:', error);
    }
  };

  // New camera-related functions
  const handlePhotoCapture = (imageUri) => {
    console.log('Photo captured:', imageUri);
    setCapturedImage(imageUri);
    setShowCamera(false);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowCamera(true);
  };

  // Render different screens based on state
  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <PlannerCamera onPhotoCapture={handlePhotoCapture} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {capturedImage ? (
        // Show captured image and retake option
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: capturedImage }} 
            style={styles.preview}
            resizeMode="contain"
          />
          <Button title="Retake Photo" onPress={handleRetake} />
        </View>
      ) : (
        // Show main interface with debugging and camera options
        <View style={styles.mainContainer}>
          <Text style={styles.text}>Test Counter: {testCounter}</Text>
          
          <Button 
            title="Test Async Operation"
            onPress={testAsyncOperation}
          />
          
          <Button 
            title="Test Error Handling"
            onPress={testErrorHandling}
          />
          
          <View style={styles.separator} />
          
          <Button 
            title="Open Camera"
            onPress={() => setShowCamera(true)}
          />
          
          <Text style={styles.text}>
            Check your Metro bundler terminal to see logs
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  preview: {
    width: '100%',
    height: '80%',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    width: '80%',
    marginVertical: 20,
  },
});