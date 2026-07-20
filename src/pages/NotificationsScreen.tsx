import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    RefreshControl
} from 'react-native';
import { fonts } from '../assets/fonts/fonts';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../assets/types/navigationTypes';
import {
    getNotificationHistory,
    markAllNotificationsAsRead,
    clearNotificationHistory,
    NotificationItem,
    syncPresentedNotifications
} from '../lib/notificationHistory';

export default function NotificationsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        // First sync any OS-level notifications we might have missed while app was killed
        await syncPresentedNotifications();
        const history = await getNotificationHistory();
        setNotifications(history);

        // If there are unread notifications, mark them as read after loading
        if (history.some(n => !n.read)) {
            await markAllNotificationsAsRead();
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleClearAll = async () => {
        await clearNotificationHistory();
        setNotifications([]);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <View style={[styles.notificationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="leaf-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                        {item.title || "Habit Reminder"}
                    </Text>
                    {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
                </View>
                <Text style={[styles.notificationBody, { color: theme.colors.textSecondary }]}>
                    {item.body}
                </Text>
                <Text style={[styles.notificationTime, { color: theme.colors.textSecondary }]}>
                    {formatDate(item.date)}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton]}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.title, { color: theme.colors.text, textAlign: 'center' }]}>Notifications</Text>
                </View>

                <View style={styles.rightActions}>
                    {notifications.length > 0 ? (
                        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                            <Ionicons name="trash-outline" size={22} color={theme.colors.error || '#ff3b30'} />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}

                    <TouchableOpacity
                        onPress={() => navigation.navigate("NotificationSettings" as any)}
                        style={styles.settingsButton}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContent}>
                    <View style={styles.emptyState}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
                            <Ionicons name="notifications-off-outline" size={64} color={theme.colors.primary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All quiet here</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                            You don't have any notifications at the moment. Check back later!
                        </Text>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    clearButton: {
        width: 30,
        height: 30,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontFamily: fonts.bold,
    },
    headerCenter: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    emptyContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    listContent: {
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: -60,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontFamily: fonts.extraBold,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        opacity: 0.7,
    },
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    notificationBody: {
        fontSize: 14,
        fontFamily: fonts.regular,
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
        fontFamily: fonts.medium,
        opacity: 0.6,
    }
    ,
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    }
});
