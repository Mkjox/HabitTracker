import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { 
  Canvas, 
  Path, 
  Circle, 
  Skia, 
  LinearGradient, 
  vec, 
  Text as SkiaText, 
  useFont 
} from '@shopify/react-native-skia';
import Animated, { 
  useSharedValue, 
  useDerivedValue, 
  withSpring, 
  withTiming, 
  interpolate,
  withRepeat,
  useAnimatedStyle
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

interface DailyProgressCircleProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
}

const DailyProgressCircle: React.FC<DailyProgressCircleProps> = ({ 
  progress, 
  size = 180, 
  strokeWidth = 15 
}) => {
  const { theme } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Animated path for progress
  const animatedProgress = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 15,
      stiffness: 90,
    });

    if (progress === 1) {
      pulse.value = withRepeat(
        withTiming(1.1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.1], [1, 0.8])
  }));

  const path = useMemo(() => {
    const p = Skia.Path.Make();
    // Start at top (-PI/2) and draw full circle
    p.addCircle(center, center, radius);
    return p;
  }, [center, radius]);

  const progressPath = useDerivedValue(() => {
    const trim = animatedProgress.value;
    const p = Skia.Path.Make();
    // For Skia, we use path effect or just draw an arc
    // However, for a simple circle, we can use p.addArc
    return p;
  }, [animatedProgress]);

  // Percentage for text display
  const percentageText = useDerivedValue(() => {
    return `${Math.round(animatedProgress.value * 100)}%`;
  });

  // Load a font for Skia (using a default system-like font or similar)
  // For now, we'll use a simple View-based percentage or Skia text if available
  // To keep it simple and robust, we'll use Skia for the ring and absolute View for text

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Canvas style={{ flex: 1 }}>
          {/* Background Track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            style="stroke"
            strokeWidth={strokeWidth}
            color={theme.colors.border}
            opacity={0.3}
          />
          
          {/* Progress Fill */}
          <Path
            path={path}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            start={0}
            end={animatedProgress}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(size, size)}
              colors={[theme.colors.primary, theme.colors.success || '#4CAF50']}
            />
          </Path>
        </Canvas>
      </Animated.View>
      <View style={styles.textOverlay}>
         <Animated.Text style={[styles.percentage, { color: theme.colors.text }]}>
            {Math.round(progress * 100)}%
         </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  }
});

export default DailyProgressCircle;
