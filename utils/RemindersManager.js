import * as Calendar from 'expo-calendar';

class RemindersManager {
  constructor() {
    this.defaultListName = 'General Reminders';
  }

  /**
   * Get all reminder lists
   */
  async getReminderLists() {
    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.REMINDER);
      return calendars.map(cal => ({
        id: cal.id,
        title: cal.title,
        color: cal.color,
        isDefault: cal.title === this.defaultListName
      }));
    } catch (error) {
      console.error('Error fetching reminder lists:', error);
      return [];
    }
  }

  /**
   * Create reminders from todos
   */
  async createReminders(todos, listId, dateInfo) {
    const results = {
      created: [],
      duplicates: [],
      errors: []
    };

    for (const todo of todos) {
      try {
        // Check for duplicates
        const isDuplicate = await this.checkDuplicate(todo, listId, dateInfo.date);
        
        if (isDuplicate) {
          results.duplicates.push(todo);
          continue;
        }

        // Create reminder with 5pm due time
        const reminderDate = new Date(dateInfo.date);
        reminderDate.setHours(17, 0, 0, 0); // 5pm COB

        const reminderId = await Calendar.createEventAsync(listId, {
          title: todo.text,
          startDate: reminderDate,
          dueDate: reminderDate,
          notes: `Imported from CloudScribble planner (${dateInfo.dayName})`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }, {
          entityType: Calendar.EntityTypes.REMINDER
        });

        results.created.push({
          ...todo,
          reminderId
        });
      } catch (error) {
        console.error(`Error creating reminder for "${todo.text}":`, error);
        results.errors.push({
          todo,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Check for duplicate reminders
   */
  async checkDuplicate(todo, listId, date) {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const reminders = await Calendar.getEventsAsync(
        [listId],
        startDate,
        endDate
      );

      return reminders.some(reminder => 
        this.normalizeText(reminder.title) === this.normalizeText(todo.text)
      );
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
  }

  normalizeText(text) {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  }
}

export default new RemindersManager();