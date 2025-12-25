import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
    SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProgress } from '../assets/data/database';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type ProgressRecord = {
    habit_id: number;
    habit_name: string;
    date: string;            // "YYYY-MM-DD"
    total_progress: number;
    custom_value?: string;
};

type HabitStreak = {
    habit_id: number;
    habit_name: string;
    streak: number;
};

const computeStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    const dayMs = 86400000;
    const today = new Date().toISOString().slice(0, 10);
    // build a Set for O(1) lookup
    const dateSet = new Set(dates);
    let streak = 0;
    let cursor = new Date(today).getTime();

    // if user didn’t complete today, start from yesterday
    if (!dateSet.has(today)) {
        cursor -= dayMs;
    }

    // count backward while each date exists
    while (dateSet.has(new Date(cursor).toISOString().slice(0, 10))) {
        streak++;
        cursor -= dayMs;
    }

    return streak;
};

const { height } = Dimensions.get("window");

export default function DashboardScreen() {
    const { isDark, theme, toggleTheme } = useTheme();
    const [habits, setHabits] = useState<HabitStreak[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getProgress();  // all progress records
            // group by habit_id
            const map: Record<number, { name: string; dates: string[] }> = {};
            data.forEach(rec => {
                if (!map[rec.habit_id]) {
                    map[rec.habit_id] = { name: rec.habit_name, dates: [] };
                }
                map[rec.habit_id].dates.push(rec.date);
            });
            // compute streaks
            const list: HabitStreak[] = Object.entries(map).map(([id, { name, dates }]) => ({
                habit_id: +id,
                habit_name: name,
                streak: computeStreak(dates)
            }));
            setHabits(list);
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // re-fetch whenever screen is focused
    useFocusEffect(useCallback(() => {
        loadData();
    }, []));

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Dashboard</Text>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={[styles.themeToggle, { backgroundColor: theme.colors.surface }]}
                    >
                        <Ionicons
                            name={isDark ? 'sunny' : 'moon'}
                            size={20}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={habits}
                    keyExtractor={item => item.habit_id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                            colors={[theme.colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="leaf-outline" size={64} color={theme.colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                No habits tracked yet.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={[
                            styles.card,
                            {
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.border,
                                borderRadius: theme.borderRadius.l
                            }
                        ]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.habitName, { color: theme.colors.text }]}>
                                    {item.habit_name}
                                </Text>
                                <View style={[styles.streakBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                                    <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                                        🔥 {item.streak} day{item.streak !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    themeToggle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    listContent: {
        paddingBottom: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    },
    card: {
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    habitName: {
        fontSize: 18,
        fontWeight: '600',
    },
    streakBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    streakText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
