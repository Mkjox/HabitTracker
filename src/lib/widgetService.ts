import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { DashboardHabit } from '../assets/types/types';
import { TodayProgressWidget } from '../widgets/TodayProgressWidget';

/**
 * Updates the home screen widget with the latest habit progress.
 */
export const updateWidgetData = async (habits: DashboardHabit[]) => {
  try {
    const completedCount = habits.filter(h => h.completedToday).length;
    const totalCount = habits.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    const data = {
      completedCount,
      totalCount,
      progress,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topHabits: habits.slice(0, 3).map(h => ({
        name: h.name,
        completed: !!h.completedToday
      }))
    };

    await requestWidgetUpdate({ 
        widgetName: 'TodayProgress',
        renderWidget: () => React.createElement(TodayProgressWidget, data)
    });
    console.log('[Widget] Update requested successfully');
  } catch (error) {
    console.error('[Widget] Sync error:', error);
  }
};
