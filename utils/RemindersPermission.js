import { EventStore } from 'expo-calendar';
import { Alert } from 'react-native';

export const requestRemindersPermission = async () => {
  try {
    const { status } = await EventStore.requestRemindersPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Reminders Access Required',
        'CloudScribble needs access to your Reminders to save your Things to Do items. Please enable Reminders access in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Reminders permission error:', error);
    return false;
  }
};