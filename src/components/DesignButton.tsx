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
import { lightTheme, darkTheme } from '../assets/colors/colors';

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

export default function DesignButton({
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
  const { isDark } = useTheme();
  const themeStyles = isDark ? darkTheme : lightTheme;

  const flattenedPrimary = StyleSheet.flatten(isDark ? darkTheme.primary : lightTheme.primary) as any;
  const primaryColor = flattenedPrimary?.color ?? '#4C4DDC';

  const containerStyles: (ViewStyle | number)[] = [styles.base];

  // size
  if (size === 'small') containerStyles.push(styles.small);
  else if (size === 'large') containerStyles.push(styles.large);
  else containerStyles.push(styles.medium);

  if (fullWidth) containerStyles.push({ width: '100%' });
  else containerStyles.push({ alignSelf: 'flex-start' });

  // variant styles
  if (variant === 'primary') {
    containerStyles.push(themeStyles.button as any);
  } else if (variant === 'secondary') {
    containerStyles.push(styles.secondaryBackground);
  } else if (variant === 'outline') {
    containerStyles.push({ backgroundColor: 'transparent', borderWidth: 1, borderColor: primaryColor });
  } else if (variant === 'ghost') {
    containerStyles.push({ backgroundColor: 'transparent' });
  }

  if (disabled) {
    containerStyles.push(styles.disabled);
  }

  if (style) containerStyles.push(style as any);

  const textStyles: (TextStyle | number)[] = [styles.textBase];
  if (variant === 'primary') {
    textStyles.push(themeStyles.buttonText as any);
  } else if (variant === 'outline' || variant === 'ghost') {
    textStyles.push(themeStyles.primary as any);
  } else if (variant === 'secondary') {
    textStyles.push({ color: isDark ? '#FFFFFF' : '#002055' });
  }

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
          <ActivityIndicator color={variant === 'primary' ? (StyleSheet.flatten(themeStyles.buttonText) as any)?.color ?? '#fff' : primaryColor} />
        ) : (
          <RNText style={textStyles}>{title ?? children}</RNText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
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
  secondaryBackground: {
    backgroundColor: '#E6E9F8',
  },
});
