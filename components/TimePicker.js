// components/TimePicker.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions
} from 'react-native';

// Import CloudScribble Colors
import { 
  Colors, 
  BackgroundColors, 
  TextColors, 
  getButtonColor 
} from '../constants/Colors';

const TimePicker = ({ isVisible, onClose, onTimeSelected, initialTime }) => {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedMeridian, setSelectedMeridian] = useState('am');

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const meridians = ['am', 'pm'];

  useEffect(() => {
    if (initialTime) {
      parseInitialTime(initialTime);
    } else {
      // Set to current time as default
      const now = new Date();
      let currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentMeridian = currentHour >= 12 ? 'pm' : 'am';
      
      // Convert to 12-hour format
      if (currentHour === 0) currentHour = 12;
      if (currentHour > 12) currentHour -= 12;
      
      setSelectedHour(currentHour);
      setSelectedMinute(currentMinute);
      setSelectedMeridian(currentMeridian);
    }
  }, [initialTime, isVisible]);

  const parseInitialTime = (timeStr) => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (match) {
      const [_, hours, minutes, meridian] = match;
      setSelectedHour(parseInt(hours));
      setSelectedMinute(parseInt(minutes));
      setSelectedMeridian(meridian.toLowerCase());
    }
  };

  const formatTime = (hour, minute, meridian) => {
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${hour}:${formattedMinute}${meridian}`;
  };

  const handleTimeConfirm = () => {
    const timeString = formatTime(selectedHour, selectedMinute, selectedMeridian);
    onTimeSelected(timeString);
  };

  // CloudScribble Button Component
  const CloudScribbleButton = ({ title, onPress, type = 'primary' }) => {
    const buttonColor = getButtonColor(type, 'normal');
    const textColor = type === 'primary' || type === 'success' ? TextColors.onPrimary : TextColors.onSecondary;

    return (
      <TouchableOpacity
        style={[styles.cloudscribbleButton, { backgroundColor: buttonColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.cloudscribbleButtonText, { color: textColor }]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  const PickerColumn = ({ data, selectedValue, onValueChange, formatValue }) => {
    const screenHeight = Dimensions.get('window').height;
    const itemHeight = 50;
    const visibleItems = Math.floor(screenHeight * 0.3 / itemHeight);
    
    return (
      <View style={styles.pickerColumn}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingVertical: (visibleItems - 1) * itemHeight / 2
          }}
        >
          {data.map((item, index) => {
            const isSelected = item === selectedValue;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pickerItem,
                  { height: itemHeight },
                  isSelected && styles.selectedPickerItem
                ]}
                onPress={() => onValueChange(item)}
              >
                <Text style={[
                  styles.pickerItemText,
                  isSelected && styles.selectedPickerItemText
                ]}>
                  {formatValue ? formatValue(item) : item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>
                {formatTime(selectedHour, selectedMinute, selectedMeridian)}
              </Text>
            </View>
          </View>

          {/* Time Picker */}
          <View style={styles.pickerContainer}>
            {/* Hours */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Hour</Text>
              <PickerColumn
                data={hours}
                selectedValue={selectedHour}
                onValueChange={setSelectedHour}
              />
            </View>

            {/* Minutes */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>Minute</Text>
              <PickerColumn
                data={minutes}
                selectedValue={selectedMinute}
                onValueChange={setSelectedMinute}
                formatValue={(minute) => minute.toString().padStart(2, '0')}
              />
            </View>

            {/* AM/PM */}
            <View style={styles.pickerSection}>
              <Text style={styles.pickerLabel}>AM/PM</Text>
              <PickerColumn
                data={meridians}
                selectedValue={selectedMeridian}
                onValueChange={setSelectedMeridian}
                formatValue={(meridian) => meridian.toUpperCase()}
              />
            </View>
          </View>

          {/* Quick Time Buttons */}
          <View style={styles.quickTimeContainer}>
            <Text style={styles.quickTimeLabel}>Quick Select:</Text>
            <View style={styles.quickTimeButtons}>
              {[
                { label: '9:00 AM', hour: 9, minute: 0, meridian: 'am' },
                { label: '12:00 PM', hour: 12, minute: 0, meridian: 'pm' },
                { label: '1:00 PM', hour: 1, minute: 0, meridian: 'pm' },
                { label: '5:00 PM', hour: 5, minute: 0, meridian: 'pm' },
                { label: '6:00 PM', hour: 6, minute: 0, meridian: 'pm' },
                { label: '7:00 PM', hour: 7, minute: 0, meridian: 'pm' }
              ].map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickTimeButton}
                  onPress={() => {
                    setSelectedHour(time.hour);
                    setSelectedMinute(time.minute);
                    setSelectedMeridian(time.meridian);
                  }}
                >
                  <Text style={styles.quickTimeButtonText}>{time.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <CloudScribbleButton
              title="Cancel"
              onPress={onClose}
              type="secondary"
            />
            <CloudScribbleButton
              title="Confirm"
              onPress={handleTimeConfirm}
              type="success"
            />
          </View>
        </View>
      </View>
    </Modal>
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
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: Colors.mauve,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: Colors.sage,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TextColors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  previewContainer: {
    backgroundColor: Colors.lavender,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.mauve,
  },
  previewText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.navy,
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 20,
  },
  pickerSection: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TextColors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  pickerColumn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.mauveLight,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: BackgroundColors.card,
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.mauveLight,
  },
  selectedPickerItem: {
    backgroundColor: Colors.mauve,
  },
  pickerItemText: {
    fontSize: 18,
    color: TextColors.primary,
  },
  selectedPickerItemText: {
    color: Colors.cream,
    fontWeight: 'bold',
  },
  quickTimeContainer: {
    marginBottom: 20,
  },
  quickTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TextColors.primary,
    marginBottom: 10,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.sageOverlay,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.sage,
  },
  quickTimeButtonText: {
    fontSize: 14,
    color: TextColors.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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

export default TimePicker;