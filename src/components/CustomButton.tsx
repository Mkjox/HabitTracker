import React from 'react';
import {
  TouchableOpacity,
  Text as RNText,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'small' | 'medium' | 'large';

type Props = {
  onPress?: (e?: GestureResponderEvent) => void;
  title?: string;
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  testID?: string;
};

export default function CustomButton({
  onPress,
  title,
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  loading = false,
  disabled = false,
  style,
  textStyle,
  testID,
}: Props) {
  const { theme } = useTheme();

  const containerStyles: (ViewStyle | number)[] = [
    styles.base,
    { borderRadius: theme.borderRadius.m }
  ];

  // size
  if (size === 'small') {
    containerStyles.push({ paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.s, borderRadius: theme.borderRadius.s });
  } else if (size === 'large') {
    containerStyles.push({ paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.l, borderRadius: theme.borderRadius.l });
  } else {
    containerStyles.push({ paddingVertical: theme.spacing.s, paddingHorizontal: theme.spacing.m });
  }

  if (fullWidth) containerStyles.push({ width: '100%' });
  else containerStyles.push({ alignSelf: 'flex-start' });

  // variant styles
  let bgColor = theme.colors.primary;
  let textColor = theme.colors.surface;
  let borderColor = 'transparent';
  let borderWidth = 0;

  if (variant === 'primary') {
    bgColor = theme.colors.primary;
    textColor = theme.colors.surface;
  } else if (variant === 'secondary') {
    bgColor = theme.colors.surface;
    textColor = theme.colors.primary;
    borderColor = theme.colors.border;
    borderWidth = 1;
  } else if (variant === 'outline') {
    bgColor = 'transparent';
    textColor = theme.colors.primary;
    borderColor = theme.colors.primary;
    borderWidth = 1;
  } else if (variant === 'ghost') {
    bgColor = 'transparent';
    textColor = theme.colors.primary;
  }

  containerStyles.push({
    backgroundColor: bgColor,
    borderColor: borderColor,
    borderWidth: borderWidth,
  });

  if (disabled) {
    containerStyles.push(styles.disabled);
  }

  if (style) containerStyles.push(style as any);

  const textStyles: (TextStyle | number)[] = [
    styles.textBase,
    { color: textColor }
  ];

  if (textStyle) textStyles.push(textStyle as any);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={containerStyles}
      testID={testID}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <RNText style={textStyles}>{title ?? children}</RNText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBase: {
    fontSize: 16,
    fontWeight: '600',
  },
});
