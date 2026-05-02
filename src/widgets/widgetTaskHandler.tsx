import React from 'react';
import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { TodayProgressWidget } from './TodayProgressWidget';
import { getDashboardData } from '../assets/data/database';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetAction, widgetInfo } = props;

  if (widgetInfo.widgetName === 'TodayProgress') {
    switch (widgetAction) {
      case 'WIDGET_ADDED':
      case 'WIDGET_UPDATE':
      case 'WIDGET_RESIZED':
        try {
            // Fetch data from database directly in the headless task
            const habits = await getDashboardData();
            const completedCount = habits.filter(h => !!h.completed_today).length;
            const totalCount = habits.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            const data = {
                completedCount,
                totalCount,
                progress,
                lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                topHabits: habits.slice(0, 3).map(h => ({
                    name: h.name,
                    completed: !!h.completed_today
                }))
            };

            props.renderWidget(<TodayProgressWidget {...data} />);
        } catch (error) {
            console.error('[WidgetTaskHandler] Error updating widget:', error);
        }
        break;

      default:
        break;
    }
  }
}
