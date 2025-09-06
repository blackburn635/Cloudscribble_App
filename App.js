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
  ActivityIndicator
} from 'react-native';
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
    console.log('App is starting up...');
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

  const renderExtractedData = () => {
    if (isProcessing) {
      return (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.processingText}>Processing text...</Text>
        </View>
      );
    }

    if (!extractedData) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Ready to process text from image
          </Text>
          <Button 
            title="Process Text" 
            onPress={processImage}
          />
        </View>
      );
    }

    return (
      <View style={styles.dataContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
            Week of {extractedData.sections[0]?.month} {extractedData.sections[0]?.date}, {extractedData.year}
          </Text>
        </View>

        <Text style={styles.dataHeader}>
          Extracted Events ({getTotalEvents()})
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
          <Text style={styles.metadataText}>
            Overall Confidence: {(extractedData.metadata.confidence * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <PlannerCamera onPhotoCapture={handlePhotoCapture} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
              <Button title="Retake Photo" onPress={handleRetake} />
              {extractedData && !isProcessing && (
                <Button 
                  title="Save to Calendar" 
                  onPress={() => setShowCalendarSelector(true)}
                />
              )}
            </View>
          </View>
        ) : (
          <View style={styles.mainContainer}>
            <Text style={styles.headerText}>Planner Scanner</Text>
            <Text style={styles.instructionText}>
              Take a photo of your planner page to extract events
            </Text>
            <Button 
              title="Open Camera"
              onPress={() => setShowCamera(true)}
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
    backgroundColor: '#fff',
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
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  preview: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  headerContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  processingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  dataContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dataHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventConfidence: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  metadataContainer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});