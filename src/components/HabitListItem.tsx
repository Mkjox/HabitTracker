import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  onToggle: () => void;
  onPress: () => void;
};

export default function HabitListItem({ 
  name, 
  streak, 
  completedToday, 
  icon = "leaf",
  onToggle, 
  onPress 
}: Props) {
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
          <Text style={styles.actionText}>{completedToday ? "Undo" : "Done"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    const scale = withSpring(completedToday ? 1.02 : 1, { damping: 15 });
    return {
      backgroundColor: withSpring(
        completedToday ? theme.colors.success + '15' : theme.colors.surface
      ),
      borderColor: withSpring(
        completedToday ? theme.colors.success : theme.colors.border
      ),
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
            { borderRadius: theme.borderRadius.l }
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
                <View style={[styles.streakBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                    🔥 {streak} {streak === 1 ? 'day' : 'days'}
                  </Text>
                </View>
              </View>
              
              <Animated.View style={[
                styles.statusIndicator, 
                animatedIndicatorStyle,
                { 
                  backgroundColor: completedToday ? theme.colors.success : theme.colors.border + '50',
                  borderColor: completedToday ? theme.colors.success : theme.colors.border
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
    borderWidth: 1,
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '700',
    marginTop: 2,
  },
});
