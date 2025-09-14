import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Colors, ButtonColors } from '../constants/Colors';
import RemindersManager from '../utils/RemindersManager';

const ReminderSelector = ({ visible, onSelect, onCancel }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    if (visible) {
      loadReminderLists();
    }
  }, [visible]);

  const loadReminderLists = async () => {
    setLoading(true);
    const reminderLists = await RemindersManager.getReminderLists();
    setLists(reminderLists);
    
    // Select default list
    const defaultList = reminderLists.find(list => list.isDefault);
    if (defaultList) {
      setSelectedList(defaultList.id);
    } else if (reminderLists.length > 0) {
      setSelectedList(reminderLists[0].id);
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    const list = lists.find(l => l.id === selectedList);
    if (list) {
      onSelect(list);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Choose Reminder List</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.confirmButton}>Select</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.sage} />
          </View>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  selectedList === item.id && styles.selectedItem
                ]}
                onPress={() => setSelectedList(item.id)}
              >
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <Text style={styles.listTitle}>{item.title}</Text>
                {selectedList === item.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.sage,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lavender,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.navy,
  },
  cancelButton: {
    fontSize: 16,
    color: ButtonColors.secondaryText,
  },
  confirmButton: {
    fontSize: 16,
    color: ButtonColors.primaryBackground,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lavender,
  },
  selectedItem: {
    backgroundColor: Colors.sageOverlay,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  listTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.navy,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.sage,
  },
});

export default ReminderSelector;