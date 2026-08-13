import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { DashboardHabit } from '../assets/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

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
      console.log('Notification permission was not granted.');
      return null;
    }
  }

  return null;
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
 * Read stored reminder time (defaults to 20:00).
 */
async function getStoredReminderTime(): Promise<{ hour: number; minute: number }> {
  try {
    const raw = await AsyncStorage.getItem('dailyReminderTime');
    if (!raw) return { hour: 20, minute: 0 };
    const [hourStr, minuteStr] = raw.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (isNaN(hour) || isNaN(minute)) return { hour: 20, minute: 0 };
    return { hour, minute };
  } catch (e) {
    console.warn('[Notifications] Failed to read stored reminder time:', e);
    return { hour: 20, minute: 0 };
  }
}

/**
 * Build the translated reminder body for the active locale.
 */
export function getHabitReminderText(
  count: number,
  translate: (key: string, options?: Record<string, unknown>) => string = i18n.t.bind(i18n)
) {
  if (count === 1) {
    return translate('notifications.reminderOne');
  }

  return translate('notifications.reminderMany', { count });
}

/**
 * Schedule a daily reminder at the stored time (default 8:00 PM).
 */
async function scheduleDailyReminder(count: number) {
  const message = getHabitReminderText(count);
  const { hour, minute } = await getStoredReminderTime();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('notifications.defaultTitle'),
      body: message,
      data: { type: 'habit_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    } as Notifications.DailyTriggerInput,
  });
}

export async function setStoredReminderTime(hour: number, minute: number) {
  try {
    const val = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    await AsyncStorage.setItem('dailyReminderTime', val);
  } catch (e) {
    console.warn('[Notifications] Failed to store reminder time:', e);
  }
}
