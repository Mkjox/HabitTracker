import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Utility for consistent haptic feedback throughout the app.
 * Fails gracefully on platforms that don't support haptics (like web or some older Androids).
 */
export const hapticFeedback = {
  /**
   * Use for successful actions (e.g., completeting a habit).
   */
  success: () => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Use for errors or warnings (e.g., failed backup).
   */
  error: () => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Use for light, subtle interactions (e.g., button press).
   */
  light: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Use for medium-strength physical feedback.
   */
  medium: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Use for strong physical feedback.
   */
  heavy: () => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Use for standard selection/toggle changes.
   */
  selection: () => {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync();
  },
};
