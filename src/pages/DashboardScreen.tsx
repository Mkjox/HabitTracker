import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProgress } from '../assets/data/database';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../assets/colors/colors';

type ProgressItem = {
    habit_id: number;
    habit_name: string;
    date: string;
    total_progress: number;
    custom_value?: string;
};

// helper to compute streak of consecutive days up to “today”
const computeStreak = (dates: string[], todayStr: string): number => {
    const dayMs = 86400000;
    let streak = 0;
    let lastTime = new Date(todayStr).getTime() + dayMs;
    Array.from(new Set(dates))
        .sort()
        .reverse()
        .forEach(d => {
            const t = new Date(d).getTime();
            if (lastTime - t === dayMs) {
                streak++;
                lastTime = t;
            }
        });
    return streak;
};

export default function DashboardScreen() {
    const { isDark } = useTheme();
    const [sections, setSections] = useState<{ title: string; data: ProgressItem[] }[]>([]);
    const [streaks, setStreaks] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState<boolean>(true);

    const themeStyles = isDark ? darkTheme : lightTheme;

    // fetch & compute whenever the screen is focused
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const load = async () => {
                setLoading(true);
                try {
                    const data = await getProgress();
                    const today = new Date().toISOString().slice(0, 10);

                    // group by date
                    const byDate: Record<string, ProgressItem[]> = {};
                    data.forEach(p => {
                        if (!byDate[p.date]) byDate[p.date] = [];
                        byDate[p.date].push(p);
                    });

                    // build sections sorted newest→oldest
                    const secs = Object.keys(byDate)
                        .sort((a, b) => b.localeCompare(a))
                        .map(date => ({ title: date, data: byDate[date] }));

                    // group by habit_id for streaks
                    const byHabit: Record<number, string[]> = {};
                    data.forEach(p => {
                        if (!byHabit[p.habit_id]) byHabit[p.habit_id] = [];
                        byHabit[p.habit_id].push(p.date);
                    });
                    const s: Record<number, number> = {};
                    Object.entries(byHabit).forEach(([hid, dates]) => {
                        s[+hid] = computeStreak(dates, today);
                    });

                    if (isActive) {
                        setSections(secs);
                        setStreaks(s);
                    }
                } catch (err) {
                    console.error('Error loading dashboard data:', err);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            load();

            return () => {
                isActive = false;
            };
        }, [])
    );

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color="#00adf5" />;
    }

    return (
        <View style={[styles.container, themeStyles.container]}>
            <Text style={[styles.screenTitle, themeStyles.text]}>Dashboard</Text>

            <SectionList
                sections={sections}
                keyExtractor={item => `${item.habit_id}-${item.date}`}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={[styles.dateHeader, themeStyles.text]}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <View style={[styles.card, themeStyles.card]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.habitName, themeStyles.text]}>{item.habit_name}</Text>
                            <Text style={[styles.streak, themeStyles.text]}>
                                🔥 {streaks[item.habit_id] ?? 0}
                            </Text>
                        </View>
                        <Text style={themeStyles.text}>
                            {item.custom_value ?? `Count: ${item.total_progress}`}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, themeStyles.text]}>No habits logged yet.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 4
    },
    card: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    habitName: {
        fontSize: 16,
        fontWeight: '600'
    },
    streak: {
        fontSize: 14
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16
    },
});
