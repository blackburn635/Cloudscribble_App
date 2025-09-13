// components/CalendarSelector.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as Calendar from 'expo-calendar';
import CalendarSync from './CalendarSync';

const CalendarSelector = ({ isVisible, onClose, events, onWriteInPlannerEvents }) => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  
  // Calendar Sync State - NEW
  const [showCalendarSync, setShowCalendarSync] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const [dateRangeForSync, setDateRangeForSync] = useState(null);

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Calendar access is needed to import events.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      const deviceCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const writableCalendars = deviceCalendars.filter(cal => cal.allowsModifications);
      setCalendars(writableCalendars);
    } catch (error) {
      console.error('Error loading calendars:', error);
      Alert.alert('Error', 'Failed to load calendars');
    } finally {
      setLoading(false);
    }
  };
  
  // NEW: Extract date range from events
  const getDateRangeFromEvents = () => {
    if (!events || events.length === 0) return null;
    
    // Find the earliest and latest dates from all events
    let earliestDate = null;
    let latestDate = null;
    
    events.forEach(event => {
      if (event.date) {
        const eventDate = new Date(event.date);
        if (!earliestDate || eventDate < earliestDate) {
          earliestDate = eventDate;
        }
        if (!latestDate || eventDate > latestDate) {
          latestDate = eventDate;
        }
      }
    });
    
    return {
      start: earliestDate,
      end: latestDate
    };
  };

  const checkForDuplicateEvent = async (calendarId, event, eventDate) => {
    try {
      // Create start and end times for the search window
      const searchStart = new Date(eventDate);
      searchStart.setHours(0, 0, 0, 0);
      const searchEnd = new Date(eventDate);
      searchEnd.setHours(23, 59, 59, 999);

      // Get all events for that day
      const existingEvents = await Calendar.getEventsAsync(
        [calendarId],
        searchStart,
        searchEnd
      );

      // Parse the event time
      const eventTime = event.hasTimeRange ? event.startTime : event.time;
      const timeMatch = eventTime.match(/(\d{1,2}):(\d{2})(am|pm)/i);
      if (!timeMatch) return false;

      let [_, hours, minutes, meridian] = timeMatch;
      hours = parseInt(hours);
      minutes = parseInt(minutes);

      // Convert to 24-hour format
      if (meridian.toLowerCase() === 'pm' && hours < 12) hours += 12;
      if (meridian.toLowerCase() === 'am' && hours === 12) hours = 0;

      // Check if any existing event matches our criteria
      return existingEvents.some(existingEvent => {
        const existingDate = new Date(existingEvent.startDate);
        const sameHour = existingDate.getHours() === hours;
        const sameMinute = existingDate.getMinutes() === parseInt(minutes);
        const similarTitle = existingEvent.title.toLowerCase() === event.title.toLowerCase();
        
        return sameHour && sameMinute && similarTitle;
      });
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  const importToCalendar = async (calendarId) => {
    try {
      setImportStatus('importing');
      setImportProgress(0);
      setDuplicateCount(0);

      const totalEvents = events.length;
      let importedCount = 0;
      let duplicates = 0;
      const errors = [];

      console.log(`Starting import of ${totalEvents} events to calendar ${calendarId}`);

      for (const event of events) {
        try {
          // Create event date from the provided date
          const eventDate = event.date;
          
          // Check for duplicate before creating
          const isDuplicate = await checkForDuplicateEvent(calendarId, event, eventDate);
          
          if (isDuplicate) {
            console.log(`Skipping duplicate event: ${event.title}`);
            duplicates++;
            continue;
          }

          // Parse time components
          const timeStr = event.hasTimeRange ? event.startTime : event.time;
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(am|pm)/i);
          if (!timeMatch) {
            throw new Error('Invalid time format');
          }

          let [_, hours, minutes, meridian] = timeMatch;
          hours = parseInt(hours);
          minutes = parseInt(minutes);

          // Convert to 24-hour format
          if (meridian.toLowerCase() === 'pm' && hours < 12) hours += 12;
          if (meridian.toLowerCase() === 'am' && hours === 12) hours = 0;

          // Set the event time
          eventDate.setHours(hours, minutes, 0, 0);

          // Create end time
          const endDate = new Date(eventDate);
          if (event.hasTimeRange) {
            // Parse end time if we have a time range
            const endTimeMatch = event.endTime.match(/(\d{1,2}):(\d{2})(am|pm)/i);
            if (endTimeMatch) {
              let [_, endHours, endMinutes, endMeridian] = endTimeMatch;
              endHours = parseInt(endHours);
              endMinutes = parseInt(endMinutes);
              
              if (endMeridian.toLowerCase() === 'pm' && endHours < 12) endHours += 12;
              if (endMeridian.toLowerCase() === 'am' && endHours === 12) endHours = 0;
              
              endDate.setHours(endHours, endMinutes, 0, 0);
            }
          } else {
            // Default 1-hour duration for single-time events
            endDate.setHours(endDate.getHours() + 1);
          }

          await Calendar.createEventAsync(calendarId, {
            title: event.title,
            startDate: eventDate,
            endDate: endDate,
            timeZone: event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            alarms: [{ relativeOffset: -30 }]
          });

          importedCount++;
          setImportProgress((importedCount / totalEvents) * 100);
          
        } catch (eventError) {
          console.error(`Error importing event ${event.title}:`, eventError);
          errors.push(`${event.title}: ${eventError.message}`);
        }
      }

      setImportStatus('completed');
      setDuplicateCount(duplicates);
      
      const message = duplicates > 0 
        ? `Imported ${importedCount} events.\nSkipped ${duplicates} duplicate events.`
        : `Successfully imported ${importedCount} events`;
      
      Alert.alert(
        'Import Complete',
        message + (errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''),
        [{ 
          text: 'OK', 
          onPress: () => {
            // NEW: After successful import, show the Calendar Sync modal
            setSelectedCalendarId(calendarId);
            setDateRangeForSync(getDateRangeFromEvents());
            setShowCalendarSync(true);
          }
        }]
      );

    } catch (error) {
      console.error('Error importing events:', error);
      setImportStatus('error');
      Alert.alert(
        'Import Error',
        'Failed to import events. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // NEW: Handle calendar sync actions
  const handleCalendarSyncActions = (actions) => {
    console.log('Calendar sync actions:', actions);
    
    // Handle write-in-planner events
    if (actions.writeInPlanner && actions.writeInPlanner.length > 0) {
      // Pass events back to parent component
      if (onWriteInPlannerEvents) {
        onWriteInPlannerEvents(actions.writeInPlanner);
      }
      
      // Removed the "Write in Planner" alert - the Success alert handles notification
    }
    
    // Close the sync modal
    setShowCalendarSync(false);
    
    // Optionally close the entire calendar selector after sync
    // Uncomment if you want to close everything after sync:
    // onClose();
  };

  const renderCalendarItem = ({ item }) => (
    <View style={styles.calendarItemContainer}>
      <TouchableOpacity
        style={styles.calendarItem}
        onPress={() => importToCalendar(item.id)}
      >
        <View style={[styles.calendarColor, { backgroundColor: item.color }]} />
        <Text style={styles.calendarName}>{item.title}</Text>
      </TouchableOpacity>
      
      {/* NEW: Optional button to directly check for orphaned events */}
      <TouchableOpacity
        style={styles.syncIconButton}
        onPress={() => {
          setSelectedCalendarId(item.id);
          setDateRangeForSync(getDateRangeFromEvents());
          setShowCalendarSync(true);
        }}
      >
        <Text style={styles.syncIcon}>🔄</Text>
      </TouchableOpacity>
    </View>
  );

  // Convert events to sections format for CalendarSync
  const extractedEventSections = events ? [{
    day: 'All Events',
    events: events
  }] : [];

  return (
    <>
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Calendar</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : importStatus === 'importing' ? (
              <View style={styles.importingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.importingText}>
                  Importing events... {Math.round(importProgress)}%
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={calendars}
                  renderItem={renderCalendarItem}
                  keyExtractor={(item) => item.id}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                
                {/* NEW: Optional button to check all calendars */}
                <TouchableOpacity 
                  style={styles.checkOrphanedButton}
                  onPress={() => {
                    if (calendars.length > 0) {
                      Alert.alert(
                        'Select Calendar',
                        'Please select a calendar first to check for orphaned events',
                        [{ text: 'OK' }]
                      );
                    }
                  }}
                >
                  <Text style={styles.checkOrphanedButtonText}>
                    Check for Orphaned Events
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* NEW: Calendar Sync Modal */}
      {showCalendarSync && (
        <CalendarSync
          isVisible={showCalendarSync}
          onClose={() => setShowCalendarSync(false)}
          calendarId={selectedCalendarId}
          extractedEvents={extractedEventSections}
          dateRange={dateRangeForSync}
          onConfirmActions={handleCalendarSyncActions}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  calendarItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    flex: 1,
  },
  calendarColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  calendarName: {
    fontSize: 16,
    flex: 1,
  },
  syncIconButton: {
    padding: 15,
    paddingLeft: 0,
  },
  syncIcon: {
    fontSize: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  checkOrphanedButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#00B4AB',
    borderRadius: 8,
    alignItems: 'center',
  },
  checkOrphanedButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  importingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  importingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  }
});

export default CalendarSelector;