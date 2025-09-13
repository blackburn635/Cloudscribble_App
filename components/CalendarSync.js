// components/CalendarSync.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as Calendar from 'expo-calendar';

const CalendarSync = ({ 
  isVisible, 
  onClose, 
  calendarId, 
  extractedEvents, 
  dateRange,
  onConfirmActions 
}) => {
  const [orphanedEvents, setOrphanedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventActions, setEventActions] = useState({});
  const [processingActions, setProcessingActions] = useState(false);

  useEffect(() => {
    if (isVisible && calendarId) {
      findOrphanedEvents();
    }
  }, [isVisible, calendarId]);

  const findOrphanedEvents = async () => {
    try {
      setLoading(true);
      setEventActions({});
      
      // Get all events from the calendar for the date range
      const calendarEvents = await getCalendarEventsForDateRange();
      
      // Find events that don't exist in the extracted planner events
      const orphaned = calendarEvents.filter(calendarEvent => 
        !isEventInPlanner(calendarEvent)
      );
      
      setOrphanedEvents(orphaned);
    } catch (error) {
      console.error('Error finding orphaned events:', error);
      Alert.alert('Error', 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const getCalendarEventsForDateRange = async () => {
    // Create start and end dates based on the scanned planner page range
    const startDate = new Date(dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    const events = await Calendar.getEventsAsync(
      [calendarId],
      startDate,
      endDate
    );
    
    return events;
  };

  const isEventInPlanner = (calendarEvent) => {
    // Use the same matching logic as duplicate detection
    const calendarDate = new Date(calendarEvent.startDate);
    const calendarHours = calendarDate.getHours();
    const calendarMinutes = calendarDate.getMinutes();
    
    // Convert to 12-hour format for comparison
    let hours = calendarHours;
    const meridian = hours >= 12 ? 'pm' : 'am';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    
    const calendarTimeStr = `${hours}:${calendarMinutes.toString().padStart(2, '0')}${meridian}`;
    
    // Check against all extracted events
    return extractedEvents.some(section => 
      section.events.some(plannerEvent => {
        const eventTime = plannerEvent.hasTimeRange ? 
          plannerEvent.startTime : plannerEvent.time;
        
        const sameTime = eventTime?.toLowerCase() === calendarTimeStr.toLowerCase();
        const sameTitle = plannerEvent.title?.toLowerCase() === 
          calendarEvent.title?.toLowerCase();
        
        return sameTime && sameTitle;
      })
    );
  };

  const handleActionSelect = (eventId, action) => {
    setEventActions(prev => ({
      ...prev,
      [eventId]: action
    }));
  };

  const handleCancelAction = (eventId) => {
    setEventActions(prev => {
      const newActions = { ...prev };
      delete newActions[eventId];
      return newActions;
    });
  };

  const handleConfirmActions = async () => {
    const actionsToProcess = Object.entries(eventActions);
    
    if (actionsToProcess.length === 0) {
      Alert.alert('No Actions', 'Please select actions for the events');
      return;
    }
    
    Alert.alert(
      'Confirm Actions',
      `You are about to process ${actionsToProcess.length} action(s). Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setProcessingActions(true);
            
            const deleteEvents = [];
            const writeInPlannerEvents = [];
            
            actionsToProcess.forEach(([eventId, action]) => {
              const event = orphanedEvents.find(e => e.id === eventId);
              if (action === 'delete') {
                deleteEvents.push(event);
              } else if (action === 'write') {
                writeInPlannerEvents.push(event);
              }
            });
            
            // Process deletions
            for (const event of deleteEvents) {
              try {
                await Calendar.deleteEventAsync(event.id);
              } catch (error) {
                console.error(`Failed to delete event ${event.id}:`, error);
              }
            }
            
            // Pass write-in-planner events back to parent
            if (onConfirmActions) {
              onConfirmActions({
                deleted: deleteEvents,
                writeInPlanner: writeInPlannerEvents
              });
            }
            
            setProcessingActions(false);
            Alert.alert(
              'Success', 
              `Processed ${actionsToProcess.length} action(s)`,
              [{ text: 'OK', onPress: onClose }]
            );
          }
        }
      ]
    );
  };

  // NEW FUNCTION ADDED - Formats the date
  const formatEventDate = (event) => {
    const date = new Date(event.startDate);
    const dayOptions = { weekday: 'long' };
    const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dayOfWeek = date.toLocaleDateString('en-US', dayOptions);
    const fullDate = date.toLocaleDateString('en-US', dateOptions);
    return `${dayOfWeek}, ${fullDate}`;
  };

  const formatEventTime = (event) => {
    const date = new Date(event.startDate);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    let displayHours = hours;
    const meridian = hours >= 12 ? 'pm' : 'am';
    if (hours > 12) displayHours -= 12;
    if (hours === 0) displayHours = 12;
    
    const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')}${meridian}`;
    
    if (event.endDate && event.endDate !== event.startDate) {
      const endDate = new Date(event.endDate);
      const endHours = endDate.getHours();
      const endMinutes = endDate.getMinutes();
      
      let displayEndHours = endHours;
      const endMeridian = endHours >= 12 ? 'pm' : 'am';
      if (endHours > 12) displayEndHours -= 12;
      if (endHours === 0) displayEndHours = 12;
      
      const endTimeStr = `${displayEndHours}:${endMinutes.toString().padStart(2, '0')}${endMeridian}`;
      return `${timeStr} - ${endTimeStr}`;
    }
    
    return timeStr;
  };

  // UPDATED FUNCTION - Now displays date, time, and title
  const renderOrphanedEvent = (event) => {
    const action = eventActions[event.id];
    const hasAction = !!action;
    
    return (
      <View 
        key={event.id} 
        style={[
          styles.eventCard,
          hasAction && styles.eventCardWithAction
        ]}
      >
        <View style={styles.eventInfo}>
          {/* NEW: Display the date */}
          <Text style={[
            styles.eventDate,
            hasAction && styles.dimmedText
          ]}>
            {formatEventDate(event)}
          </Text>
          {/* Display the time */}
          <Text style={[
            styles.eventTime,
            hasAction && styles.dimmedText
          ]}>
            {formatEventTime(event)}
          </Text>
          {/* Display the title */}
          <Text style={[
            styles.eventTitle,
            hasAction && styles.dimmedText
          ]}>
            {event.title}
          </Text>
          {hasAction && (
            <Text style={styles.actionText}>
              Action: {action === 'delete' ? 'Delete' : 'Write in Planner'}
            </Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          {!hasAction ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleActionSelect(event.id, 'delete')}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.writeButton]}
                onPress={() => handleActionSelect(event.id, 'write')}
              >
                <Text style={styles.actionButtonText}>Write in Planner</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelAction(event.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar Sync</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          Events found in your calendar but not in your planner
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00B4AB" />
            <Text style={styles.loadingText}>Checking calendar...</Text>
          </View>
        ) : orphanedEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>✅</Text>
            <Text style={styles.emptyMessage}>
              Your calendar and planner are in sync!
            </Text>
            <Text style={styles.emptySubMessage}>
              No orphaned events found.
            </Text>
          </View>
        ) : (
          <>
            <ScrollView style={styles.eventsList}>
              {orphanedEvents.map(renderOrphanedEvent)}
            </ScrollView>
            
            <View style={styles.footer}>
              <Text style={styles.footerInfo}>
                {Object.keys(eventActions).length} of {orphanedEvents.length} events selected
              </Text>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  Object.keys(eventActions).length === 0 && styles.confirmButtonDisabled
                ]}
                onPress={handleConfirmActions}
                disabled={Object.keys(eventActions).length === 0 || processingActions}
              >
                {processingActions ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Actions</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 32,
    color: '#718096',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#718096',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubMessage: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  eventsList: {
    flex: 1,
    padding: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventCardWithAction: {
    backgroundColor: '#F7FAFC',
    opacity: 0.8,
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventDate: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 16,
    color: '#00B4AB',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 17,
    color: '#2D3748',
    fontWeight: '500',
    marginBottom: 4,
  },
  dimmedText: {
    color: '#A0AEC0',
  },
  actionText: {
    fontSize: 14,
    color: '#4A5568',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FED7D7',
  },
  writeButton: {
    backgroundColor: '#C6F6D5',
  },
  cancelButton: {
    backgroundColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E4E8',
  },
  footerInfo: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#00B4AB',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CalendarSync;