import React from "react";
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableStateCallbackType,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { darkTheme, lightTheme } from "../assets/colors/colors";

interface CustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { isDark } = useTheme();
  const theme: any = isDark ? darkTheme : lightTheme;
  const isDisabled = disabled || loading;

  const gradientColors =
    (isDisabled
      ? theme.gradients?.buttonDisabled ?? theme.gradients?.button
      : theme.gradients?.button) ?? ["#1c6d79", "#3ba7a3"];

  const textColor = theme.colors?.buttonText ?? "#fff";
  const rippleColor = theme.rippleColor ?? "rgba(255,255,255,0.15)";

  return (
    <View style={[styles.wrapper, style]}>
      {/* Gradient behind the Pressable — allows ripple to render above it */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.gradient]}
      />

      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        android_ripple={{
          color: rippleColor,
          borderless: false,
        }}
        style={(state: PressableStateCallbackType) => [
          styles.buttonBase,
          isDisabled && styles.disabledButton,
          state.pressed && Platform.OS === "ios" ? { opacity: 0.6 } : null,
          StyleSheet.absoluteFill
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text
            style={[
              styles.textBase,
              theme.styles?.buttonText,
              { color: textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 10,
    overflow: "hidden", // ensures ripple and gradient clip properly
  },
  gradient: {
    borderRadius: 10,
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  textBase: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CustomButton;
