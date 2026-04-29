import React from 'react';
import { View, Text } from 'react-native';
import { createWidget } from 'expo-widgets';

// Define the widget component
export const todayProgressWidget = createWidget('today_progress', (props: any) => {
  // Use data from updateSnapshot
  const { 
    completedCount = 0, 
    totalCount = 0, 
    progress = 0, 
    lastUpdated = '',
    topHabits = []
  } = props || {};

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: '#FFFFFF' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>Today</Text>
        <Text style={{ fontSize: 12, color: '#4F46E5', fontWeight: 'bold' }}>{progress}%</Text>
      </View>

      <View style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 12 }}>
        <View style={{ width: `${progress}%`, height: 6, backgroundColor: '#4F46E5', borderRadius: 3 }} />
      </View>

      <Text style={{ fontSize: 12, color: '#4B5563', marginBottom: 8 }}>
        {completedCount} of {totalCount} completed
      </Text>

      <View style={{ flex: 1 }}>
        {topHabits.map((habit: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: habit.completed ? '#10B981' : '#E2E8F0', marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: habit.completed ? '#10B981' : '#111827' }} numberOfLines={1}>
              {habit.name}
            </Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'right' }}>
        Updated {lastUpdated}
      </Text>
    </View>
  );
});

export default function Widgets() {
    return null; // The registration happens at the top level
}
