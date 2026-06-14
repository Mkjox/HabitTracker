import React from 'react';
import { fonts } from '../assets/fonts/fonts';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import HabitListItem from '../components/HabitListItem';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../assets/types/navigationTypes';
import { useHabitStore } from '../store/useHabitStore';
import DailyProgressCircle from '../components/DailyProgressCircle';

export default function DashboardScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isDark, theme, toggleTheme } = useTheme();
    const { habits, loading, toggleHabit, refresh, weeklyProgress, categories } = useHabitStore();

    const completedCount = habits.filter(h => h.completedToday).length;
    const totalCount = habits.length;
    const progress = totalCount > 0 ? completedCount / totalCount : 0;

    const onRefresh = () => {
        refresh();
    };

    const renderHeader = () => (
                <View>
                    <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.summaryContent}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Today's Goal</Text>
                    <Text style={[styles.summarySub, { color: theme.colors.textSecondary }]}>
                        {completedCount} of {totalCount} habits completed
                    </Text>
                    
                    <View style={styles.streakBadgeContainer}>
                        <View style={[styles.streakBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="flame" size={14} color={theme.colors.primary} />
                            <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                                {Math.max(...habits.map(h => h.streak), 0)} peak streak
                            </Text>
                        </View>
                    </View>
                </View>
                <DailyProgressCircle progress={progress} size={90} strokeWidth={8} />
            </View>
                    </View>

                    {categories.length === 0 && (
                        <View style={[styles.noticeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.noticeTitle, { color: theme.colors.text }]}>No categories found</Text>
                                <Text style={[styles.noticeSub, { color: theme.colors.textSecondary }]}>You need at least one category to create habits. Create categories in Settings.</Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Categories' as any)} style={[styles.noticeButton, { backgroundColor: theme.colors.primary }]}>
                                <Text style={{ color: '#fff', fontFamily: fonts.bold }}>Open Categories</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
    );

    if (loading && habits.length === 0) {
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
                    <View style={styles.headerActions as any}>
                        <Ionicons 
                            name="notifications-outline" 
                            size={24} 
                            color={theme.colors.textSecondary} 
                            style={{ marginRight: 16 }}
                            onPress={() => navigation.navigate("Notifications")}
                        />
                        <Ionicons 
                            name={isDark ? 'sunny-outline' : 'moon-outline'} 
                            size={24} 
                            color={theme.colors.textSecondary}
                            onPress={toggleTheme}
                        />
                    </View>
                </View>

                <FlatList
                    data={habits}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
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
                        <HabitListItem
                            habitId={item.id}
                            name={item.name}
                            streak={item.streak}
                            completedToday={item.completedToday}
                            icon={item.icon}
                            frequencyType={item.frequency_type}
                            frequencyValue={item.frequency_value}
                            weeklyProgress={weeklyProgress[item.id] || 0}
                            onToggle={() => toggleHabit(item.id)}
                            onPress={() => navigation.navigate("HabitDetails", {
                                habitId: item.id,
                                habitName: item.name,
                                habitDescription: item.description || "",
                                icon: item.icon,
                                frequencyType: item.frequency_type,
                                frequencyValue: item.frequency_value
                            })}
                        />
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
        fontSize: 32,
        fontFamily: fonts.extraBold,
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 40,
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
        noticeCard: {
            marginTop: 12,
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginBottom: 18,
        },
        noticeTitle: {
            fontSize: 16,
            fontFamily: fonts.bold,
            marginBottom: 4,
        },
        noticeSub: {
            fontSize: 13,
        },
        noticeButton: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            marginLeft: 12,
        },
    summaryCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1.5,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    summaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryTitle: {
        fontSize: 24,
        fontFamily: fonts.extraBold,
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    summarySub: {
        fontSize: 14,
        fontFamily: fonts.medium,
        marginBottom: 16,
    },
    streakBadgeContainer: {
        flexDirection: 'row',
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    streakText: {
        fontSize: 12,
        fontFamily: fonts.bold,
        marginLeft: 4,
        textTransform: 'uppercase',
    }
});
