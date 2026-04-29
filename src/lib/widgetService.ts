import { todayProgressWidget } from '../widgets/index';
import { DashboardHabit } from '../assets/types/types';

/**
 * Updates the home screen widget with the latest habit progress.
 */
export const updateWidgetData = async (habits: DashboardHabit[]) => {
  try {
    const completedCount = habits.filter(h => h.completedToday).length;
    const totalCount = habits.length;
    const progress = totalCount > 0 ? completedCount / totalCount : 0;

    // Create a summary for the widget
    const data = {
      completedCount,
      totalCount,
      progress: Math.round(progress * 100),
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topHabits: habits.slice(0, 3).map(h => ({
        name: h.name,
        completed: h.completedToday
      }))
    };

    // expo-widgets uses updateSnapshot to share JSON with the native side
    todayProgressWidget.updateSnapshot(data);
    console.log('[Widget] Data synced successfully');
  } catch (error) {
    console.error('[Widget] Sync error:', error);
  }
};
