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
import EditEvent from './components/EditEvent';

// NEW IMPORTS FOR TODO/REMINDERS
import TodoReview from './components/TodoReview';
import ReminderSelector from './components/ReminderSelector';
import RemindersManager from './utils/RemindersManager';
import { requestRemindersPermission } from './utils/RemindersPermission';

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCalendarSelector, setShowCalendarSelector] = useState(false);
  
  // Edit Event State
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingEventSection, setEditingEventSection] = useState(null);
  
  // Calendar Sync State
  const [writeInPlannerEvents, setWriteInPlannerEvents] = useState([]);
  
  // NEW TODO/REMINDERS STATE
  const [showTodoReview, setShowTodoReview] = useState(false);
  const [showReminderSelector, setShowReminderSelector] = useState(false);
  const [extractedTodos, setExtractedTodos] = useState(null);
  const [selectedTodos, setSelectedTodos] = useState(null);

  useEffect(() => {
    console.log('CloudScribble App is starting up...');
  }, []);

  const handlePhotoCapture = (imageUri) => {
    console.log('Photo captured:', imageUri);
    setCapturedImage(imageUri);
    setShowCamera(false);
  };

  // Navigate back to home screen
  const handleGoHome = () => {
    Alert.alert(
      'Return to Home',
      'Are you sure you want to return to home? Any unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Go Home', 
          style: 'destructive',
          onPress: () => {
            setShowCamera(false);
            setCapturedImage(null);
            setExtractedData(null);
            setIsProcessing(false);
            setShowCalendarSelector(false);
            setShowEditEvent(false);
            setEditingEvent(null);
            setEditingEventSection(null);
            setWriteInPlannerEvents([]);
            // Reset todo states
            setShowTodoReview(false);
            setShowReminderSelector(false);
            setExtractedTodos(null);
            setSelectedTodos(null);
          }
        }
      ]
    );
  };

  // Camera back navigation handler
  const handleCameraBack = () => {
    setShowCamera(false);
  };

  // UPDATED processImage function to handle todos
  const processImage = async () => {
    if (!capturedImage) return;

    try {
      setIsProcessing(true);
      console.log('Starting text processing...');

      const textProcessor = new PlannerTextProcessor(capturedImage);
      const result = await textProcessor.processPage();

      if (result.success) {
        console.log('Text processing successful:', result.data);
        
        // Add unique IDs and day section references to events and todos
        const processedData = {
          ...result.data,
          sections: result.data.sections.map(section => ({
            ...section,
            events: section.events.map((event, index) => ({
              ...event,
              id: `${section.day}-${index}-${Date.now()}`,
              daySection: section.day,
              date: section.date
            })),
            todos: section.todos || [] // Ensure todos array exists
          }))
        };
        
        setExtractedData(processedData);
        setExtractedTodos(processedData.sections); // Store sections with todos
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
    setExtractedTodos(null);
    setShowCamera(true);
  };

  const handleEditEvent = (event, section) => {
    console.log('Editing event:', event);
    setEditingEvent({
      ...event,
      daySection: section.day,
      date: section.date
    });
    setEditingEventSection(section);
    setShowEditEvent(true);
  };

  const handleSaveEvent = (editedEvent) => {
    console.log('Saving edited event:', editedEvent);
    
    setExtractedData(prevData => {
      const newData = { ...prevData };
      
      // Find the original section and remove the event
      const originalSection = newData.sections.find(section => 
        section.events.some(event => event.id === editedEvent.id)
      );
      
      if (originalSection) {
        originalSection.events = originalSection.events.filter(
          event => event.id !== editedEvent.id
        );
      }
      
      // Find the target section (may be different if day was changed)
      const targetSection = newData.sections.find(section => 
        section.day === editedEvent.daySection
      );
      
      if (targetSection) {
        // Add the edited event to the target section
        targetSection.events.push({
          ...editedEvent,
          confidence: editedEvent.confidence || 0.8
        });
        
        // Sort events in the target section by time
        targetSection.events.sort((a, b) => {
          const timeA = a.hasTimeRange ? a.startTime : a.time;
          const timeB = b.hasTimeRange ? b.startTime : b.time;
          return compareEventTimes(timeA, timeB);
        });
      }
      
      return newData;
    });
  };

  const handleDeleteEvent = (eventToDelete) => {
    console.log('Deleting event:', eventToDelete);
    
    setExtractedData(prevData => {
      const newData = { ...prevData };
      
      // Find the section containing the event and remove it
      newData.sections = newData.sections.map(section => ({
        ...section,
        events: section.events.filter(event => event.id !== eventToDelete.id)
      }));
      
      return newData;
    });
  };
  
  // Handle write-in-planner events from Calendar Sync
  const handleWriteInPlannerEvents = (events) => {
    setWriteInPlannerEvents(events);
  };
  
  // Format event date for display
  const formatCalendarEventDate = (event) => {
    const date = new Date(event.startDate);
    const dayOptions = { weekday: 'long' };
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dayOfWeek = date.toLocaleDateString('en-US', dayOptions);
    const fullDate = date.toLocaleDateString('en-US', dateOptions);
    return `${dayOfWeek}, ${fullDate}`;
  };

  // Format event time for display
  const formatCalendarEventTime = (event) => {
    const date = new Date(event.startDate);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    let displayHours = hours;
    const meridian = hours >= 12 ? 'pm' : 'am';
    if (hours > 12) displayHours -= 12;
    if (hours === 0) displayHours = 12;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${meridian}`;
  };

  // NEW TODO/REMINDERS FUNCTIONS
  const checkAndShowTodos = (sections) => {
    const hasTodos = sections.some(s => s.todos && s.todos.length > 0);
    if (hasTodos) {
      console.log('Found todos, showing review screen');
      setShowTodoReview(true);
    } else {
      console.log('No todos found to review');
    }
  };

  const handleTodoReviewConfirm = async (todos) => {
    console.log(`Confirmed ${todos.length} todos for reminder creation`);
    setSelectedTodos(todos);
    setShowTodoReview(false);
    
    // Request reminders permission
    const hasPermission = await requestRemindersPermission();
    if (hasPermission) {
      setShowReminderSelector(true);
    }
  };

  const handleTodoReviewCancel = () => {
    setShowTodoReview(false);
    setSelectedTodos(null);
  };

  const handleReminderListSelect = async (list) => {
    setShowReminderSelector(false);
    
    try {
      setIsProcessing(true);
      
      // Group todos by day for processing
      const todosByDay = {};
      selectedTodos.forEach(todo => {
        const key = `${todo.dayName}-${todo.dayDate}`;
        if (!todosByDay[key]) {
          todosByDay[key] = {
            date: todo.dayDate,
            dayName: todo.dayName,
            todos: []
          };
        }
        todosByDay[key].todos.push(todo);
      });

      // Create reminders for each day
      let totalCreated = 0;
      let totalDuplicates = 0;
      let totalErrors = 0;
      
      for (const dateInfo of Object.values(todosByDay)) {
        const results = await RemindersManager.createReminders(
          dateInfo.todos,
          list.id,
          dateInfo
        );
        totalCreated += results.created.length;
        totalDuplicates += results.duplicates.length;
        totalErrors += results.errors.length;
      }

      // Show success message
      let message = `${totalCreated} reminder${totalCreated !== 1 ? 's' : ''} created`;
      if (totalDuplicates > 0) {
        message += `\n${totalDuplicates} duplicate${totalDuplicates !== 1 ? 's' : ''} skipped`;
      }
      if (totalErrors > 0) {
        message += `\n${totalErrors} error${totalErrors !== 1 ? 's' : ''} occurred`;
      }
      
      Alert.alert('Reminders Saved', message);
      
      // Reset state
      setSelectedTodos(null);
      setExtractedTodos(null);
      
    } catch (error) {
      Alert.alert('Error', `Failed to create reminders: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReminderSelectorCancel = () => {
    setShowReminderSelector(false);
    setSelectedTodos(null);
  };

  const getTotalEvents = () => {
    if (!extractedData?.sections) return 0;
    return extractedData.sections.reduce((total, section) => 
      total + (section.events?.length || 0), 0
    );
  };

  // NEW: Get total todos count
  const getTotalTodos = () => {
    if (!extractedData?.sections) return 0;
    return extractedData.sections.reduce((total, section) => 
      total + (section.todos?.length || 0), 0
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

  // Helper function to compare event times for sorting
  const compareEventTimes = (time1, time2) => {
    return parseTimeString(time1) - parseTimeString(time2);
  };

  const parseTimeString = (timeStr) => {
    if (!timeStr) return 0;

    const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (!match) return 0;

    let [_, hours, minutes, meridian] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (meridian.toLowerCase() === 'pm' && hours !== 12) {
      hours += 12;
    } else if (meridian.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
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

  // Navigation Header Component
  const NavigationHeader = ({ title, onBackPress, onHomePress }) => {
    return (
      <View style={styles.navigationHeader}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={onBackPress}
        >
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>{title}</Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={onHomePress}
        >
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
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
            title="Process Text" 
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
            Page of {extractedData.sections[0]?.month} {extractedData.sections[0]?.date}, {extractedData.year}
          </Text>
        </View>

        <Text style={styles.dataHeader}>
          Extracted Events ({getTotalEvents()})
          {getTotalTodos() > 0 && ` • ${getTotalTodos()} Tasks`}
        </Text>
        
        {/* Write-in-planner reminder section */}
        {writeInPlannerEvents.length > 0 && (
          <View style={styles.writeInPlannerReminder}>
            <Text style={styles.reminderTitle}>📝 Write in Planner:</Text>
            {writeInPlannerEvents.map((event, index) => (
              <View key={index} style={styles.reminderItem}>
                <Text style={styles.reminderDate}>{formatCalendarEventDate(event)}</Text>
                <Text style={styles.reminderTime}>{formatCalendarEventTime(event)}</Text>
                <Text style={styles.reminderText}>{event.title}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setWriteInPlannerEvents([])}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {extractedData.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>
              {section.day}
            </Text>
            {section.events.map((event, eventIndex) => (
              <View key={event.id || eventIndex} style={styles.eventItem}>
                <View style={styles.eventContent}>
                  <View style={styles.eventDetails}>
                    {renderEventTime(event)}
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventConfidence}>
                      Confidence: {(event.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditEvent(event, section)}
                    >
                      <Text style={styles.actionIcon}>✏️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            {section.events.length === 0 && (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No events detected for this day</Text>
              </View>
            )}
            
            {/* NEW: Display todos for this section */}
            {section.todos && section.todos.length > 0 && (
              <View style={styles.todosContainer}>
                <Text style={styles.todosHeader}>Things to Do:</Text>
                {section.todos.map((todo, index) => (
                  <View key={todo.id || index} style={styles.todoItemDisplay}>
                    <Text style={styles.todoText}>• {todo.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {extractedData.metadata && (
          <View style={styles.metadataContainer}>
            <Text style={[styles.metadataText, { color: getStatusColor(extractedData.metadata.totalConfidence) }]}>
              Overall Confidence: {(extractedData.metadata.totalConfidence * 100).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (showCamera) {
    return (
      <PlannerCamera 
        onPhotoCapture={handlePhotoCapture}
        onBackPress={handleCameraBack}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
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
            <NavigationHeader 
              title="Event Extraction"
              onBackPress={handleRetake}
              onHomePress={handleGoHome}
            />
            
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.preview}
              resizeMode="contain"
            />
            {renderExtractedData()}
            <View style={styles.buttonContainer}>
              <CloudScribbleButton 
                title="Retake Photo" 
                onPress={handleRetake}
                type="secondary"
              />
              {extractedData && !isProcessing && (
                <>
                  <CloudScribbleButton 
                    title="Save to Calendar" 
                    onPress={() => setShowCalendarSelector(true)}
                    type="success"
                  />
                  {getTotalTodos() > 0 && (
                    <CloudScribbleButton 
                      title="Review Tasks" 
                      onPress={() => setShowTodoReview(true)}
                      type="primary"
                    />
                  )}
                </>
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
                <Text style={styles.featureIcon}>✏️</Text>
                <Text style={styles.featureText}>Edit and refine events as needed</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📅</Text>
                <Text style={styles.featureText}>Sync to your calendar</Text>
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

      <CalendarSelector
        isVisible={showCalendarSelector}
        onClose={() => {
          setShowCalendarSelector(false);
          // Check for todos after calendar import
          if (extractedTodos) {
            checkAndShowTodos(extractedTodos);
          }
        }}
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
        onWriteInPlannerEvents={(events) => {
          handleWriteInPlannerEvents(events);
          setShowCalendarSelector(false);  // Close calendar selector
          // Check for todos after handling write-in events
          if (extractedTodos) {
            checkAndShowTodos(extractedTodos);
          }
        }}
      />

      <EditEvent
        isVisible={showEditEvent}
        onClose={() => {
          setShowEditEvent(false);
          setEditingEvent(null);
          setEditingEventSection(null);
        }}
        event={editingEvent}
        availableDays={extractedData?.sections?.map(section => ({
          day: section.day,
          shortDay: section.shortDay || section.day.substring(0, 3),
          date: section.date,
          month: section.month
        })) || []}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* NEW: Todo Review Modal */}
      {showTodoReview && (
        <TodoReview
          visible={showTodoReview}
          todos={extractedTodos}
          onConfirm={handleTodoReviewConfirm}
          onCancel={handleTodoReviewCancel}
        />
      )}

      {/* NEW: Reminder Selector Modal */}
      {showReminderSelector && (
        <ReminderSelector
          visible={showReminderSelector}
          onSelect={handleReminderListSelect}
          onCancel={handleReminderSelectorCancel}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.main,
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
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  headerLogo: {
    width: 120,
    height: 120,
  },
  scrollContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: TextColors.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featureContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.lightPurple,
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
    flex: 1,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: BackgroundColors.main,
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.creamAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sage,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    color: Colors.lightPurple,
    fontSize: 16,
    fontWeight: '600',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.navy,
  },
  preview: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  processingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 15,
    fontSize: 16,
    color: TextColors.secondary,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: TextColors.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  dataContainer: {
    padding: 20,
  },
  headerContainer: {
    backgroundColor: Colors.sageOverlay,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  extractedHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.navy,
    textAlign: 'center',
  },
  dataHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 15,
    textAlign: 'center',
  },
  // Write-in-planner reminder styles
  writeInPlannerReminder: {
    backgroundColor: '#FFF8DC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  reminderItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4B5',
  },
  reminderDate: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: 14,
    color: '#00B4AB',
    fontWeight: '600',
    marginBottom: 2,
  },
  reminderText: {
    fontSize: 15,
    color: '#4A5568',
  },
  dismissButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  dismissButtonText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.mauve,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: Colors.lavender,
  },
  eventItem: {
    backgroundColor: Colors.cream,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.sage,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetails: {
    flex: 1,
    padding: 15,
  },
  eventActions: {
    paddingRight: 15,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.lavender,
    borderWidth: 1,
    borderColor: Colors.mauve,
  },
  actionIcon: {
    fontSize: 16,
    color: Colors.navy,
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
  noEventsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.sageOverlay,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  noEventsText: {
    fontSize: 14,
    color: TextColors.secondary,
    fontStyle: 'italic',
  },
  // NEW: Todo display styles
  todosContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: Colors.lavender,
    borderRadius: 8,
  },
  todosHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 8,
  },
  todoItemDisplay: {
    marginBottom: 5,
  },
  todoText: {
    fontSize: 14,
    color: TextColors.primary,
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
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
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