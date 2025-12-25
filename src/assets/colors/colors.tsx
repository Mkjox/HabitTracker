import { StyleSheet } from "react-native";

export type Theme = {
    dark: boolean;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        card: string;
        text: string;
        textSecondary: string;
        border: string;
        notification: string;
        error: string;
        success: string;
        warning: string;
        placeholder: string;
        icon: string;
        transparent: string;
        tabBar: string;
        shadow: string;
    };
    spacing: {
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
    };
    borderRadius: {
        s: number;
        m: number;
        l: number;
        xl: number;
        round: number;
    };
};

export const lightTheme: Theme = {
    dark: false,
    colors: {
        primary: '#4F46E5', // Indigo
        secondary: '#7C3AED', // Violet
        background: '#F9FAFB', // Slate 50
        surface: '#FFFFFF',
        card: '#FFFFFF',
        text: '#111827', // Gray 900
        textSecondary: '#4B5563', // Gray 600
        border: '#E5E7EB', // Gray 200
        notification: '#EF4444',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        placeholder: '#9CA3AF',
        icon: '#6B7280',
        transparent: 'rgba(255, 255, 255, 0.8)',
        tabBar: '#FFFFFF',
        shadow: '#000000',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 4,
        m: 8,
        l: 12,
        xl: 20,
        round: 9999,
    },
};

export const darkTheme: Theme = {
    dark: true,
    colors: {
        primary: '#6366F1', // Indigo 500
        secondary: '#8B5CF6', // Violet 500
        background: '#0F172A', // Slate 900
        surface: '#1E293B', // Slate 800
        card: '#1E293B',
        text: '#F9FAFB', // Gray 50
        textSecondary: '#9CA3AF', // Gray 400
        border: '#334155', // Slate 700
        notification: '#F87171',
        error: '#F87171',
        success: '#34D399',
        warning: '#FBBF24',
        placeholder: '#6B7280',
        icon: '#9CA3AF',
        transparent: 'rgba(15, 23, 42, 0.8)',
        tabBar: '#1E293B',
        shadow: '#000000',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 4,
        m: 8,
        l: 12,
        xl: 20,
        round: 9999,
    },
};

// For backward compatibility during migration
export const lightPalette = lightTheme.colors;
export const darkPalette = darkTheme.colors;

// Legend styles (legacy support)
export const lightStyles = StyleSheet.create({
    container: { backgroundColor: lightTheme.colors.background },
    text: { color: lightTheme.colors.text },
    card: { backgroundColor: lightTheme.colors.card },
});

export const darkStyles = StyleSheet.create({
    container: { backgroundColor: darkTheme.colors.background },
    text: { color: darkTheme.colors.text },
    card: { backgroundColor: darkTheme.colors.card },
});
