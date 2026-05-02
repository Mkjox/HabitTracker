import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function TodayProgressWidget({ 
  progress = 0, 
  completedCount = 0, 
  totalCount = 0,
  lastUpdated = '',
  topHabits = [] 
}: any) {
  // Use flex to calculate percentage width on Android Widgets
  const fillFlex = Math.max(0.01, progress);
  const emptyFlex = Math.max(0.01, 100 - progress);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <FlexWidget style={{ flexDirection: 'column' }}>
        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextWidget
            text="Today"
            style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}
          />
          <TextWidget
            text={`${progress}%`}
            style={{ fontSize: 14, color: '#4F46E5', fontWeight: 'bold' }}
          />
        </FlexWidget>

        {/* Progress Bar Container */}
        <FlexWidget
          style={{
            height: 8,
            width: 'match_parent',
            backgroundColor: '#E2E8F0',
            borderRadius: 4,
            marginTop: 8,
            marginBottom: 12,
            flexDirection: 'row',
            overflow: 'hidden'
          }}
        >
          {/* Progress Bar Fill */}
          <FlexWidget
            style={{
              height: 8,
              flex: fillFlex,
              backgroundColor: '#4F46E5',
            }}
          />
          <FlexWidget style={{ flex: emptyFlex, height: 8 }} />
        </FlexWidget>

        <TextWidget
          text={`${completedCount} of ${totalCount} habits completed`}
          style={{ fontSize: 12, color: '#4B5563', marginBottom: 8 }}
        />

        <FlexWidget style={{ flexDirection: 'column' }}>
          {topHabits.slice(0, 3).map((habit: any, i: number) => (
            <FlexWidget key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
               <FlexWidget 
                  style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: 4, 
                      backgroundColor: habit.completed ? '#10B981' : '#E2E8F0', 
                      marginRight: 8 
                  }} 
               />
               <TextWidget 
                 text={habit.name}
                 style={{ fontSize: 13, color: habit.completed ? '#10B981' : '#111827' }}
               />
            </FlexWidget>
          ))}
        </FlexWidget>
      </FlexWidget>

      <TextWidget
        text={`Updated ${lastUpdated}`}
        style={{ 
            fontSize: 10, 
            color: '#9CA3AF', 
            textAlign: 'right'
        }}
      />
    </FlexWidget>
  );
}
