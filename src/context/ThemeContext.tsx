import React, { createContext, useState, useEffect, useContext } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setIsDark(colorScheme === 'dark');
        });
        return () => listener.remove();
    }, []);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);