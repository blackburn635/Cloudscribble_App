import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import { Colors, ButtonColors, TextColors } from '../constants/Colors';

const TodoReview = ({ visible, todos, onConfirm, onCancel }) => {
  const [editedTodos, setEditedTodos] = useState({});
  const [selectedTodos, setSelectedTodos] = useState(new Set());

  useEffect(() => {
    if (visible && todos) {
      // Initialize with all todos selected
      const allIds = new Set();
      const todosByDay = {};
      
      todos.forEach(section => {
        section.todos.forEach(todo => {
          allIds.add(todo.id);
          if (!todosByDay[section.day]) {
            todosByDay[section.day] = [];
          }
          todosByDay[section.day].push({
            ...todo,
            dayDate: section.date,
            dayName: section.day
          });
        });
      });
      
      setSelectedTodos(allIds);
      setEditedTodos(todosByDay);
    }
  }, [visible, todos]);

  const toggleTodoSelection = (todoId) => {
    const newSelected = new Set(selectedTodos);
    if (newSelected.has(todoId)) {
      newSelected.delete(todoId);
    } else {
      newSelected.add(todoId);
    }
    setSelectedTodos(newSelected);
  };

  const updateTodoText = (dayName, todoId, newText) => {
    setEditedTodos(prev => ({
      ...prev,
      [dayName]: prev[dayName].map(todo =>
        todo.id === todoId ? { ...todo, text: newText } : todo
      )
    }));
  };

  const deleteTodo = (dayName, todoId) => {
    setEditedTodos(prev => ({
      ...prev,
      [dayName]: prev[dayName].filter(todo => todo.id !== todoId)
    }));
    selectedTodos.delete(todoId);
    setSelectedTodos(new Set(selectedTodos));
  };

  const handleConfirm = () => {
    const selectedTodosList = [];
    Object.entries(editedTodos).forEach(([day, dayTodos]) => {
      dayTodos.forEach(todo => {
        if (selectedTodos.has(todo.id)) {
          selectedTodosList.push(todo);
        }
      });
    });

    if (selectedTodosList.length === 0) {
      Alert.alert('No Tasks Selected', 'Please select at least one task to save.');
      return;
    }

    onConfirm(selectedTodosList);
  };

  const getTotalCount = () => {
    return Object.values(editedTodos).flat().length;
  };

  const getSelectedCount = () => {
    return selectedTodos.size;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Review Things to Do</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.confirmButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {getSelectedCount()} of {getTotalCount()} tasks selected
          </Text>
        </View>

        <ScrollView style={styles.content}>
          {Object.entries(editedTodos).map(([dayName, dayTodos]) => (
            <View key={dayName} style={styles.daySection}>
              <Text style={styles.dayHeader}>{dayName}</Text>
              {dayTodos.map(todo => (
                <View key={todo.id} style={styles.todoItem}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleTodoSelection(todo.id)}
                  >
                    <Text>{selectedTodos.has(todo.id) ? '☑' : '☐'}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.todoInput}
                    value={todo.text}
                    onChangeText={(text) => updateTodoText(dayName, todo.id, text)}
                    placeholder="Enter task..."
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteTodo(dayName, todo.id)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
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
  countContainer: {
    padding: 15,
    backgroundColor: Colors.sageOverlay,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lavender,
  },
  countText: {
    fontSize: 14,
    color: TextColors.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  daySection: {
    marginBottom: 25,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.mauve,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: Colors.lavender,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lavender,
  },
  checkbox: {
    marginRight: 10,
    fontSize: 20,
  },
  todoInput: {
    flex: 1,
    fontSize: 16,
    color: TextColors.primary,
    padding: 5,
  },
  deleteButton: {
    padding: 5,
  },
  deleteIcon: {
    fontSize: 18,
  },
});

export default TodoReview;