import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";
import { Theme, lightTheme, darkTheme } from "../assets/colors/colors";

type ThemeContextType = {
    isDark: boolean;
    theme: Theme;
    toggleTheme: () => void;
    isLoadingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    theme: lightTheme,
    toggleTheme: () => { },
    isLoadingTheme: false,
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'themePreference';

type Props = { children: ReactNode };

export const ThemeProvider = ({ children }: Props) => {
    const [isDark, setIsDark] = useState<boolean>(false);
    const [isLoadingTheme, setIsLoadingTheme] = useState<boolean>(true);

    const theme = isDark ? darkTheme : lightTheme;

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored === 'dark') {
                    setIsDark(true);
                }
                else if (stored === 'light') {
                    setIsDark(false);
                }
                else {
                    const sys: ColorSchemeName = Appearance.getColorScheme();
                    setIsDark(sys === 'dark');
                }
            }
            catch (e) {
                console.warn('Failed to load theme preference:', e);
                const sys: ColorSchemeName = Appearance.getColorScheme();
                setIsDark(sys === 'dark');
            }
            finally {
                setIsLoadingTheme(false);
            }
        })();
    }, []);

    const toggleTheme = async () => {
        try {
            const newIsDark = !isDark;
            setIsDark(newIsDark);
            await AsyncStorage.setItem(STORAGE_KEY, newIsDark ? 'dark' : 'light');
        }
        catch (e) {
            console.warn('Failed to save theme preference:', e);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, theme, toggleTheme, isLoadingTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
