import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProgress } from '../assets/data/database';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../assets/colors/colors';
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

const {height} = Dimensions.get("window");

export default function DashboardScreen() {
    const { isDark, toggleTheme } = useTheme();
    const [habits, setHabits] = useState<HabitStreak[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const themeStyles = isDark ? darkTheme : lightTheme;

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
        return <ActivityIndicator style={styles.loader} size="large" color="#00adf5" />;
    }

    return (
        <View style={[styles.container, themeStyles.container]}>
            <View style={styles.top}>

                <View style={styles.topSection}>
                    <Text style={[styles.title, themeStyles.text]}>Habit Streaks</Text>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={[styles.button]}
                    >
                        <Ionicons
                            name={isDark ? 'sunny-outline' : 'moon-outline'}
                            size={28}
                            color={themeStyles.icon.color}
                        />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={habits}
                    keyExtractor={item => item.habit_id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00adf5']} />
                    }
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, themeStyles.text]}>
                            No habits tracked yet.
                        </Text>
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.card, themeStyles.card]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.habitName, themeStyles.text]}>
                                    {item.habit_name}
                                </Text>
                                <Text style={[styles.streak, themeStyles.text]}>
                                    🔥 {item.streak} day{item.streak !== 1 ? 's' : ''}
                                </Text>
                            </View>
                        </View>
                    )}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    top: {
        marginTop: height * 0.01
    },
    topSection: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12
    },
    button: {
        padding: 10,
        borderRadius: 50,
        alignSelf: 'flex-end',
    },
    loader: {
        flex: 1,
        justifyContent: 'center'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16
    },
    card: {
        padding: 12,
        borderRadius: 8,
        marginVertical: 6,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    habitName: {
        fontSize: 16,
        fontWeight: '600'
    },
    streak: {
        fontSize: 14
    }
});