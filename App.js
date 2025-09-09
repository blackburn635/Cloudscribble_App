// App.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Button, 
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import CloudScribble Colors
import { 
  Colors, 
  BackgroundColors, 
  TextColors, 
  ButtonColors,
  StatusColors,
  getButtonColor,
  getStatusColor 
} from './constants/Colors';

import PlannerCamera from './components/PlannerCamera';
import { PlannerTextProcessor } from './utils/PlannerTextProcessor';
import CalendarSelector from './components/CalendarSelector';

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);

  useEffect(() => {
    console.log('CloudScribble App is starting up...');
  }, []);

  const handlePhotoCapture = (imageUri) => {
    console.log('Photo captured:', imageUri);
    setCapturedImage(imageUri);
    setShowCamera(false);
  };

  const processImage = async () => {
    if (!capturedImage) return;

    try {
      setIsProcessing(true);
      console.log('Starting text processing...');

      const textProcessor = new PlannerTextProcessor(capturedImage);
      const result = await textProcessor.processPage();

      if (result.success) {
        console.log('Text processing successful:', result.data);
        setExtractedData(result.data);
      } else {
        throw new Error(result.error || 'Text processing failed');
      }
    } catch (error) {
      console.error('Text processing error:', error);
      Alert.alert(
        'Processing Error',
        'Failed to extract text from image. Would you like to try again?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: processImage }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setShowCamera(true);
  };

  const getTotalEvents = () => {
    if (!extractedData?.sections) return 0;
    return extractedData.sections.reduce((total, section) => 
      total + (section.events?.length || 0), 0
    );
  };

  const renderEventTime = (event) => {
    if (event.hasTimeRange) {
      return (
        <Text style={styles.eventTime}>
          {event.startTime} - {event.endTime}
        </Text>
      );
    }
    return <Text style={styles.eventTime}>{event.time}</Text>;
  };

  // CloudScribble Branded Button Component
  const CloudScribbleButton = ({ title, onPress, type = 'primary', disabled = false, icon = null }) => {
    const buttonColor = getButtonColor(type, disabled ? 'disabled' : 'normal');
    const textColor = type === 'primary' || type === 'success' ? TextColors.onPrimary : TextColors.onSecondary;

    return (
      <TouchableOpacity
        style={[
          styles.cloudscribbleButton,
          { backgroundColor: buttonColor, opacity: disabled ? 0.6 : 1 }
        ]}
        onPress={disabled ? null : onPress}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {icon && (
            <Image 
              source={icon}
              style={styles.buttonIcon}
              resizeMode="contain"
            />
          )}
          <Text style={[styles.cloudscribbleButtonText, { color: textColor }]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderExtractedData = () => {
    if (isProcessing) {
      return (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={Colors.mauve} />
          <Text style={styles.processingText}>Processing your planner page...</Text>
        </View>
      );
    }

    if (!extractedData) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Ready to extract events from your planner
          </Text>
          <CloudScribbleButton 
            title="📖 Process Text" 
            onPress={processImage}
            type="primary"
          />
        </View>
      );
    }

    return (
      <View style={styles.dataContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.extractedHeaderText}>
            Week of {extractedData.sections[0]?.month} {extractedData.sections[0]?.date}, {extractedData.year}
          </Text>
        </View>

        <Text style={styles.dataHeader}>
          📅 Extracted Events ({getTotalEvents()})
        </Text>

        {extractedData.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>
              {section.day}
            </Text>
            {section.events.map((event, eventIndex) => (
              <View key={eventIndex} style={styles.eventItem}>
                {renderEventTime(event)}
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventConfidence}>
                  Confidence: {(event.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.metadataContainer}>
          <Text style={[styles.metadataText, { color: getStatusColor('success') }]}>
            ✅ Overall Confidence: {(extractedData.metadata.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor={BackgroundColors.main} />
        <PlannerCamera onPhotoCapture={handlePhotoCapture} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor={BackgroundColors.main} />
      
      {/* Navy Header with CloudScribble Icon */}
      <View style={styles.appHeader}>
        <View style={styles.logoPanel}>
          <Image 
            source={require('./assets/icons/Full_Icon_no_background.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {capturedImage ? (
          <View style={styles.resultContainer}>
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.preview}
              resizeMode="contain"
            />
            {renderExtractedData()}
            <View style={styles.buttonContainer}>
              <CloudScribbleButton 
                title="📷 Retake Photo" 
                onPress={handleRetake}
                type="secondary"
              />
              {extractedData && !isProcessing && (
                <CloudScribbleButton 
                  title="📅 Save to Calendar" 
                  onPress={() => setShowCalendarSelector(true)}
                  type="success"
                />
              )}
            </View>
          </View>
        ) : (
          <View style={styles.mainContainer}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome to CloudScribble</Text>
              <Text style={styles.instructionText}>
                Sync your Cloudscribble paper planner with your digital calendar with just a few clicks
              </Text>
            </View>
            
            <View style={styles.featureContainer}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📸</Text>
                <Text style={styles.featureText}>Scan your planner page</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🤖</Text>
                <Text style={styles.featureText}>AI extracts events automatically</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📅</Text>
                <Text style={styles.featureText}>Sync to the calendar of your choice</Text>
              </View>
            </View>

            <CloudScribbleButton 
              title="Start Scanning"
              onPress={() => setShowCamera(true)}
              type="primary"
              icon={require('./assets/icons/Icon3.png')}
            />
          </View>
        )}
      </ScrollView>

      {/* Calendar Selector Modal */}
      <CalendarSelector
        isVisible={showCalendarSelector}
        onClose={() => setShowCalendarSelector(false)}
        events={extractedData?.sections?.flatMap(section => 
          section.events.map(event => ({
            ...event,
            date: new Date(extractedData.year, 
                          ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december']
                          .indexOf(section.month.toLowerCase()), 
                          section.date),
            timezone: extractedData.metadata.timezone
          }))
        ) || []}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.main, // CloudScribble cream
  },
  appHeader: {
    backgroundColor: Colors.navy,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoPanel: {
    backgroundColor: Colors.cream,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLogo: {
    width: 200,
    height: 79,
  },
  scrollContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TextColors.primary, // Navy
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    color: TextColors.secondary, // Warm gray
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  featureContainer: {
    marginBottom: 40,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BackgroundColors.card,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.mauve,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: TextColors.primary,
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  preview: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.mauveLight,
  },
  headerContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: Colors.lavender,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.mauve,
  },
  extractedHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: TextColors.primary,
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: BackgroundColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mauveLight,
  },
  processingText: {
    marginTop: 15,
    fontSize: 16,
    color: TextColors.secondary,
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.sageOverlay,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.sage,
  },
  noDataText: {
    fontSize: 16,
    color: TextColors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  dataContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: BackgroundColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mauveLight,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.mauve,
  },
  dataHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TextColors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  eventItem: {
    backgroundColor: BackgroundColors.card,
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sage,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: TextColors.primary,
    marginBottom: 4,
  },
  eventConfidence: {
    fontSize: 12,
    color: Colors.warmGray,
    marginTop: 4,
  },
  metadataContainer: {
    marginTop: 20,
    padding: 15,
    borderTopWidth: 2,
    borderTopColor: Colors.sage,
    backgroundColor: Colors.sageOverlay,
    borderRadius: 8,
  },
  metadataText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    gap: 15,
  },
  // CloudScribble Button Styles
  cloudscribbleButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  },
  buttonIcon: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  cloudscribbleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 