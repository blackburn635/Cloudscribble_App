// components/EditEvent.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Switch
} from 'react-native';

// Import CloudScribble Colors (assuming same structure as App.js)
import { 
  Colors, 
  BackgroundColors, 
  TextColors, 
  ButtonColors,
  getButtonColor 
} from '../constants/Colors';

import TimePicker from './TimePicker';

const EditEvent = ({ 
  isVisible, 
  onClose, 
  event, 
  availableDays, 
  onSave, 
  onDelete 
}) => {
  const [editedEvent, setEditedEvent] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerType, setTimePickerType] = useState('single'); // 'single', 'start', 'end'
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setEditedEvent({
        id: event.id || Date.now(), // Generate ID if not present
        title: event.title || '',
        time: event.time || '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        hasTimeRange: event.hasTimeRange || false,
        date: event.date || '',
        daySection: event.daySection || '',
        confidence: event.confidence || 0.8,
        bounds: event.bounds || {}
      });
      setErrors({});
    }
  }, [event]);

  const validateEvent = () => {
    const newErrors = {};
    
    if (!editedEvent.title || editedEvent.title.trim().length === 0) {
      newErrors.title = 'Event title is required';
    }
    
    if (editedEvent.hasTimeRange) {
      if (!editedEvent.startTime) {
        newErrors.startTime = 'Start time is required';
      }
      if (!editedEvent.endTime) {
        newErrors.endTime = 'End time is required';
      }
      // Check if end time is after start time
      if (editedEvent.startTime && editedEvent.endTime) {
        const startMinutes = parseTimeToMinutes(editedEvent.startTime);
        const endMinutes = parseTimeToMinutes(editedEvent.endTime);
        if (endMinutes <= startMinutes) {
          newErrors.endTime = 'End time must be after start time';
        }
      }
    } else {
      if (!editedEvent.time) {
        newErrors.time = 'Time is required';
      }
    }
    
    if (!editedEvent.daySection) {
      newErrors.daySection = 'Day selection is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseTimeToMinutes = (timeStr) => {
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

  const handleSave = () => {
    if (validateEvent()) {
      // Clean up the event object before saving
      const cleanEvent = {
        ...editedEvent,
        title: editedEvent.title.trim()
      };
      
      onSave(cleanEvent);
      onClose();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete(editedEvent);
            onClose();
          }
        }
      ]
    );
  };

  const handleTimeSelected = (selectedTime) => {
    if (timePickerType === 'single') {
      setEditedEvent(prev => ({ ...prev, time: selectedTime }));
    } else if (timePickerType === 'start') {
      setEditedEvent(prev => ({ ...prev, startTime: selectedTime }));
    } else if (timePickerType === 'end') {
      setEditedEvent(prev => ({ ...prev, endTime: selectedTime }));
    }
    setShowTimePicker(false);
  };

  const openTimePicker = (type) => {
    setTimePickerType(type);
    setShowTimePicker(true);
  };

  const toggleTimeRange = (value) => {
    setEditedEvent(prev => ({
      ...prev,
      hasTimeRange: value,
      // Reset time fields when switching modes
      ...(value ? { time: '' } : { startTime: '', endTime: '' })
    }));
  };

  // CloudScribble Button Component (matching App.js style)
  const CloudScribbleButton = ({ title, onPress, type = 'primary', disabled = false }) => {
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
        <Text style={[styles.cloudscribbleButtonText, { color: textColor }]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

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
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.modalTitle}>Edit Event</Text>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>

              {/* Event Title */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Event Title</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.title && styles.errorInput
                  ]}
                  value={editedEvent.title}
                  onChangeText={(text) => {
                    setEditedEvent(prev => ({ ...prev, title: text }));
                    if (errors.title) {
                      setErrors(prev => ({ ...prev, title: null }));
                    }
                  }}
                  placeholder="Enter event title"
                  placeholderTextColor={Colors.warmGray}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              {/* Time Range Toggle */}
              <View style={styles.fieldContainer}>
                <View style={styles.switchContainer}>
                  <Text style={styles.fieldLabel}>Time Range Event</Text>
                  <Switch
                    value={editedEvent.hasTimeRange}
                    onValueChange={toggleTimeRange}
                    trackColor={{ false: Colors.warmGray, true: Colors.mauve }}
                    thumbColor={editedEvent.hasTimeRange ? Colors.navy : Colors.cream}
                  />
                </View>
                <Text style={styles.fieldDescription}>
                  {editedEvent.hasTimeRange 
                    ? 'Event has start and end times' 
                    : 'Event has a single time'
                  }
                </Text>
              </View>

              {/* Time Selection */}
              {editedEvent.hasTimeRange ? (
                <View style={styles.timeRangeContainer}>
                  <View style={styles.timeFieldContainer}>
                    <Text style={styles.fieldLabel}>Start Time</Text>
                    <TouchableOpacity
                      style={[
                        styles.timeButton,
                        errors.startTime && styles.errorInput
                      ]}
                      onPress={() => openTimePicker('start')}
                    >
                      <Text style={styles.timeButtonText}>
                        {editedEvent.startTime || 'Select start time'}
                      </Text>
                      <Text style={styles.timeIcon}>⏰</Text>
                    </TouchableOpacity>
                    {errors.startTime && <Text style={styles.errorText}>{errors.startTime}</Text>}
                  </View>

                  <View style={styles.timeFieldContainer}>
                    <Text style={styles.fieldLabel}>End Time</Text>
                    <TouchableOpacity
                      style={[
                        styles.timeButton,
                        errors.endTime && styles.errorInput
                      ]}
                      onPress={() => openTimePicker('end')}
                    >
                      <Text style={styles.timeButtonText}>
                        {editedEvent.endTime || 'Select end time'}
                      </Text>
                      <Text style={styles.timeIcon}>⏰</Text>
                    </TouchableOpacity>
                    {errors.endTime && <Text style={styles.errorText}>{errors.endTime}</Text>}
                  </View>
                </View>
              ) : (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Time</Text>
                  <TouchableOpacity
                    style={[
                      styles.timeButton,
                      errors.time && styles.errorInput
                    ]}
                    onPress={() => openTimePicker('single')}
                  >
                    <Text style={styles.timeButtonText}>
                      {editedEvent.time || 'Select time'}
                    </Text>
                    <Text style={styles.timeIcon}>⏰</Text>
                  </TouchableOpacity>
                  {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
                </View>
              )}

              {/* Day Selection */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Day</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.dayScrollContainer}
                >
                  {availableDays.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        editedEvent.daySection === day.day && styles.selectedDayButton
                      ]}
                      onPress={() => {
                        setEditedEvent(prev => ({ 
                          ...prev, 
                          daySection: day.day,
                          date: day.date
                        }));
                        if (errors.daySection) {
                          setErrors(prev => ({ ...prev, daySection: null }));
                        }
                      }}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        editedEvent.daySection === day.day && styles.selectedDayButtonText
                      ]}>
                        {day.shortDay}
                      </Text>
                      <Text style={[
                        styles.dayDateText,
                        editedEvent.daySection === day.day && styles.selectedDayDateText
                      ]}>
                        {day.date}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.daySection && <Text style={styles.errorText}>{errors.daySection}</Text>}
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <CloudScribbleButton
                  title="Cancel"
                  onPress={onClose}
                  type="secondary"
                />
                <CloudScribbleButton
                  title="Save Changes"
                  onPress={handleSave}
                  type="success"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <TimePicker
        isVisible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onTimeSelected={handleTimeSelected}
        initialTime={
          timePickerType === 'single' ? editedEvent.time :
          timePickerType === 'start' ? editedEvent.startTime :
          editedEvent.endTime
        }
      />
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
    backgroundColor: BackgroundColors.main,
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: Colors.mauve,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: Colors.sage,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TextColors.primary,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.sageOverlay,
  },
  deleteIcon: {
    fontSize: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TextColors.primary,
    marginBottom: 8,
  },
  fieldDescription: {
    fontSize: 14,
    color: TextColors.secondary,
    marginTop: 5,
  },
  textInput: {
    borderWidth: 2,
    borderColor: Colors.mauveLight,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: BackgroundColors.card,
    color: TextColors.primary,
  },
  errorInput: {
    borderColor: Colors.coral,
  },
  errorText: {
    color: Colors.coral,
    fontSize: 14,
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRangeContainer: {
    marginBottom: 20,
  },
  timeFieldContainer: {
    marginBottom: 15,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.mauveLight,
    borderRadius: 10,
    padding: 15,
    backgroundColor: BackgroundColors.card,
  },
  timeButtonText: {
    fontSize: 16,
    color: TextColors.primary,
  },
  timeIcon: {
    fontSize: 20,
  },
  dayScrollContainer: {
    marginTop: 5,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.mauveLight,
    backgroundColor: BackgroundColors.card,
    alignItems: 'center',
    minWidth: 60,
  },
  selectedDayButton: {
    backgroundColor: Colors.mauve,
    borderColor: Colors.navy,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: TextColors.primary,
  },
  selectedDayButtonText: {
    color: Colors.cream,
  },
  dayDateText: {
    fontSize: 12,
    color: TextColors.secondary,
    marginTop: 2,
  },
  selectedDayDateText: {
    color: Colors.cream,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    gap: 15,
  },
  cloudscribbleButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cloudscribbleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EditEvent;