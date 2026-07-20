import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NOTIFICATIONS_STORAGE_KEY = '@habit_tracker_notifications_history';

export interface NotificationItem {
  id: string;
  title: string | null;
  body: string | null;
  date: string;
  read: boolean;
  type?: string;
}

export async function getNotificationHistory(): Promise<NotificationItem[]> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Failed to get notification history:', error);
    return [];
  }
}

export async function saveNotificationToHistory(notification: Notifications.Notification) {
  try {
    const history = await getNotificationHistory();
    
    // Check if we already logged this specific notification (using its id)
    const exists = history.some(item => item.id === notification.request.identifier);
    if (exists) return;

    const newItem: NotificationItem = {
      id: notification.request.identifier,
      title: notification.request.content.title,
      body: notification.request.content.body,
      date: new Date(notification.date).toISOString(),
      read: false,
      type: notification.request.content.data?.type as string | undefined,
    };

    const newHistory = [newItem, ...history].slice(0, 100); // Keep last 100
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save notification to history:', error);
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const history = await getNotificationHistory();
    const updated = history.map(item => ({ ...item, read: true }));
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark notifications as read:', error);
  }
}

export async function clearNotificationHistory() {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear notification history:', error);
  }
}

/**
 * Checks for currently presented notifications (in OS center) and adds them to history
 * This is useful if the app was killed when the notification was delivered.
 */
export async function syncPresentedNotifications() {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    for (const notification of presented) {
      await saveNotificationToHistory(notification);
    }
  } catch (error) {
    console.error('Failed to sync presented notifications:', error);
  }
}
