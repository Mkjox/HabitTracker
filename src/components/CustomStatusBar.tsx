import React, { useEffect } from "react";
import { Platform, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../context/ThemeContext";

const CustomStatusBar: React.FC = () => {
    const { isDark } = useTheme();

    useEffect(() => {
        // Android-specific update - make status bar translucent and set background to avoid white line
        if (Platform.OS === 'android') {
            RNStatusBar.setTranslucent(true)
            RNStatusBar.setBackgroundColor('transparent', true)
            RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true)
        }
    }, [isDark])

    return (
        <StatusBar
            style={isDark ? 'light' : 'dark'}
            backgroundColor="transparent"
            translucent={true}
        />
    )
}

export default CustomStatusBar