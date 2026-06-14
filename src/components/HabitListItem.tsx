import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { fonts } from '../assets/fonts/fonts';
import Animated, { 
  FadeInDown, 
  FadeOutLeft, 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor 
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../lib/haptics';

type Props = {
  habitId: number;
  name: string;
  streak: number;
  completedToday: boolean;
  icon?: string;
  frequencyType?: 'daily' | 'weekly' | 'custom';
  frequencyValue?: number;
  weeklyProgress?: number;
  onToggle: () => void;
  onPress: () => void;
};

export default function HabitListItem({ 
  name, 
  streak, 
  completedToday, 
  icon = "leaf",
  frequencyType = "daily",
  frequencyValue = 0,
  weeklyProgress = 0,
  onToggle, 
  onPress 
}: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const handleToggle = () => {
    hapticFeedback.success();
    onToggle();
  };

  const renderRightActions = () => {
    return (
      <View style={styles.rightActionContainer}>
        <TouchableOpacity 
          onPress={handleToggle}
          style={[styles.completeAction, { backgroundColor: theme.colors.success }]}
        >
          <Ionicons 
            name={completedToday ? "close-circle-outline" : "checkmark-circle-outline"} 
            size={28} 
            color="#fff" 
          />
          <Text style={styles.actionText}>{completedToday ? t('dashboard.undo') : t('dashboard.done')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    const scale = withSpring(completedToday ? 1.02 : 1, { damping: 15 });
    return {
      backgroundColor: completedToday ? theme.colors.success + '15' : theme.colors.surface,
      borderColor: completedToday ? theme.colors.success : theme.colors.border,
      transform: [{ scale }]
    };
  });

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const scale = withSpring(completedToday ? 1.2 : 1, { damping: 12, stiffness: 100 });
    return {
      transform: [{ scale }]
    };
  });

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).springify()} 
      exiting={FadeOutLeft.duration(300)}
    >
      <Swipeable
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
        onSwipeableOpen={(direction) => {
          if (direction === 'right') {
            handleToggle();
          }
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
        >
          <Animated.View style={[
            styles.card,
            animatedCardStyle,
            { 
              borderRadius: theme.borderRadius.l,
              borderWidth: completedToday ? 1 : 0,
              borderColor: completedToday ? theme.colors.success + '40' : theme.colors.border,
              elevation: completedToday ? 0 : 2,
              shadowOpacity: completedToday ? 0 : 0.05,
              marginHorizontal: 5,
              marginVertical: 5,
              backgroundColor: theme.colors.background
            }
          ]}>
            <View style={styles.content}>
              <View style={[
                styles.iconContainer, 
                { backgroundColor: completedToday ? theme.colors.success + '20' : theme.colors.primary + '10' }
              ]}>
                <Ionicons 
                  name={icon as any} 
                  size={24} 
                  color={completedToday ? theme.colors.success : theme.colors.primary} 
                />
              </View>
              <View style={styles.mainInfo}>
                <Text style={[
                  styles.habitName, 
                  { 
                    color: theme.colors.text,
                    textDecorationLine: completedToday ? 'line-through' : 'none',
                    opacity: completedToday ? 0.6 : 1
                  }
                ]}>
                  {name}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.streakBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                      🔥 {streak} {streak === 1 ? t('dashboard.day') : t('dashboard.days')}
                    </Text>
                  </View>
                  
                  {frequencyType === 'weekly' && (
                    <View style={[styles.freqBadge, { backgroundColor: theme.colors.success + '15' }]}>
                      <Text style={[styles.freqText, { color: theme.colors.success }]}>
                         {t('dashboard.thisWeek', { current: weeklyProgress, total: frequencyValue })}
                      </Text>
                    </View>
                  )}
                  
                  {frequencyType === 'custom' && (
                    <View style={[styles.freqBadge, { backgroundColor: (theme.colors.info || '#00adf5') + '15' }]}>
                      <Text style={[styles.freqText, { color: theme.colors.info || '#00adf5' }]}>
                         {t('dashboard.customSchedule')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <Animated.View style={[
                styles.statusIndicator, 
                animatedIndicatorStyle,
                { 
                  backgroundColor: completedToday ? theme.colors.success : theme.colors.border + '30',
                  borderColor: completedToday ? theme.colors.success : theme.colors.border,
                  borderWidth: 1.5,
                }
              ]}>
                {completedToday && <Ionicons name="checkmark" size={16} color="#fff" />}
              </Animated.View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 12,
    borderWidth: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    marginBottom: 6,
  },
  streakBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  freqBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freqText: {
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  rightActionContainer: {
    marginBottom: 12,
    width: 80,
  },
  completeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.bold,
    marginTop: 2,
  },
});
