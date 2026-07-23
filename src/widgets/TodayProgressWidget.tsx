import React from 'react';
import { Appearance } from 'react-native';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { fonts } from '../assets/fonts/fonts';

type WidgetColor = any;

type WidgetPalette = {
  background: WidgetColor;
  surface: WidgetColor;
  border: WidgetColor;
  text: WidgetColor;
  secondary: WidgetColor;
  accent: WidgetColor;
  accentSoft: WidgetColor;
  success: WidgetColor;
  muted: WidgetColor;
  track: WidgetColor;
};

export function TodayProgressWidget({
  progress = 0,
  completedCount = 0,
  totalCount = 0,
  lastUpdated = '',
  topHabits = []
}: any) {
  const isDark = Appearance.getColorScheme() === 'dark';
  const palette: WidgetPalette = isDark
    ? {
        background: '#111827',
        surface: '#1F2937',
        border: '#374151',
        text: '#F9FAFB',
        secondary: '#9CA3AF',
        accent: '#8B5CF6',
        accentSoft: '#4C1D95',
        success: '#34D399',
        muted: '#6B7280',
        track: '#374151',
      }
    : {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        text: '#111827',
        secondary: '#64748B',
        accent: '#4F46E5',
        accentSoft: '#E0E7FF',
        success: '#10B981',
        muted: '#94A3B8',
        track: '#E2E8F0',
      };

  const fillFlex = Math.max(0.01, progress / 100);
  const emptyFlex = Math.max(0.01, 1 - progress / 100);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: palette.background,
        borderRadius: 20,
        padding: 14,
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      <FlexWidget style={{ flexDirection: 'column' }}>
        <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <FlexWidget style={{ flexDirection: 'column', marginRight: 8 }}>
            <TextWidget
              text="Today"
              style={{ fontSize: 17, fontFamily: fonts.bold, color: palette.text }}
            />
            <TextWidget
              text={`${completedCount}/${totalCount} completed`}
              style={{ fontSize: 11, color: palette.secondary, marginTop: 2 }}
            />
          </FlexWidget>

          <FlexWidget
            style={{
              backgroundColor: isDark ? '#4338CA' : '#E0E7FF',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              marginLeft: 8,
            }}
          >
            <TextWidget
              text={`${progress}%`}
              style={{ fontSize: 13, color: isDark ? '#F9FAFB' : '#312E81', fontFamily: fonts.bold }}
            />
          </FlexWidget>
        </FlexWidget>

        <FlexWidget
          style={{
            height: 8,
            width: 'match_parent',
            backgroundColor: palette.track,
            borderRadius: 999,
            marginBottom: 10,
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          <FlexWidget
            style={{
              height: 8,
              flex: fillFlex,
              backgroundColor: palette.accent,
            }}
          />
          <FlexWidget style={{ flex: emptyFlex, height: 8 }} />
        </FlexWidget>

        <FlexWidget style={{ flexDirection: 'column', marginBottom: 8 }}>
          {topHabits.slice(0, 3).map((habit: any, i: number) => (
            <FlexWidget key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <FlexWidget
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: habit.completed ? palette.success : palette.muted,
                  marginRight: 8,
                }}
              />
              <TextWidget
                text={habit.name}
                style={{ fontSize: 12, color: habit.completed ? palette.success : palette.text }}
              />
            </FlexWidget>
          ))}
        </FlexWidget>
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'column', marginTop: 6 }}>
        <TextWidget
          text={totalCount > 0 ? 'Keep going ✨' : 'Add habits'}
          style={{ fontSize: 10, color: palette.secondary, marginBottom: 2 }}
        />
        <TextWidget
          text={`Updated ${lastUpdated}`}
          style={{ fontSize: 10, color: palette.muted, textAlign: 'left' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
