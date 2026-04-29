import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { DashboardHabit } from '../assets/types/types';

// Configure how notifications should be handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions and return the token.
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (projectId) {
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        }
    } catch (e) {
        console.warn("Could not get push token", e);
    }
  }

  return token;
}

/**
 * Schedule or cancel reminders based on habit progress.
 */
export async function updateHabitReminders(habits: DashboardHabit[]) {
  const incompleteHabits = habits.filter(h => !h.completedToday);

  // Clear existing reminders
  await cancelAllReminders();

  if (incompleteHabits.length > 0) {
    console.log(`[Notifications] Scheduling reminder for ${incompleteHabits.length} habits.`);
    await scheduleDailyReminder(incompleteHabits.length);
  } else {
    console.log('[Notifications] All habits completed. No reminder scheduled.');
  }
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule a daily reminder at 8:00 PM.
 */
async function scheduleDailyReminder(count: number) {
  const message = count === 1 
    ? "You still have one habit to complete today! 🌿"
    : `You still have ${count} habits to complete today! 🌿`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Habit Reminder",
      body: message,
      data: { type: 'habit_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    } as Notifications.DailyTriggerInput,
  });
}
