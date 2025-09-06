// PlannerCamera.js
// Camera component specialized for capturing 17" x 11" planner pages
// Uses anchor marks for image alignment and processing
// Maintains correct aspect ratio and provides visual guides for capture

import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { CameraView } from 'expo-camera';

const PlannerCamera = () => {
 // Calculate view height to maintain 17:11 aspect ratio based on screen width
 // This ensures the preview matches planner dimensions
 const screenWidth = Dimensions.get('window').width;
 const height = (screenWidth * 11) / 17;

 return (
   <View style={[styles.container, { height }]}>
     <CameraView 
       style={styles.camera} 
       orientation="landscape" // Force landscape mode for proper planner orientation
     >
       {/* Overlay container for all visual guides */}
       <View style={styles.overlay}>
         {/* Circular guides for 3.5mm anchor marks */}
         <View style={[styles.anchorGuide, styles.topLeft]} />
         <View style={[styles.anchorGuide, styles.bottomRight]} />
         
         {/* Rectangle showing planner page boundaries */}
         <View style={styles.pageGuide} />
         
         {/* Camera capture button */}
         <View style={styles.captureButton} />
       </View>
     </CameraView>
   </View>
 );
};

const styles = StyleSheet.create({
 container: {
   width: '100%', // Use full screen width
 },
 camera: {
   flex: 1, // Camera preview fills container
 },
 overlay: {
   ...StyleSheet.absoluteFillObject, // Overlay covers entire camera view
 },
 anchorGuide: {
   position: 'absolute',
   width: 20, // Size of circular guide matching 3.5mm anchor marks
   height: 20,
   borderWidth: 2,
   borderColor: '#fff',
   borderRadius: 10, // Create circle shape
 },
 topLeft: {
   // Position guide for top-left anchor mark
   top: '5%',
   left: '5%',
 },
 bottomRight: {
   // Position guide for bottom-right anchor mark
   bottom: '5%',
   right: '5%',
 },
 pageGuide: {
   // Rectangle showing entire page boundaries
   position: 'absolute',
   top: '4%',
   left: '4%',
   right: '4%',
   bottom: '4%',
   borderWidth: 1,
   borderColor: 'rgba(255,255,255,0.5)', // Semi-transparent for less visual interference
 },
 captureButton: {
   // Large circular button for taking photo
   position: 'absolute',
   right: '5%',
   top: '50%',
   width: 70,
   height: 70,
   borderRadius: 35,
   backgroundColor: '#fff',
   transform: [{ translateY: -35 }], // Center button vertically
 }
});

export default PlannerCamera;