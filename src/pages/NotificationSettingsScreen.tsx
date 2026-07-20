import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Switch
} from 'react-native';
import { fonts } from '../assets/fonts/fonts';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../assets/types/navigationTypes';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { updateHabitReminders, setStoredReminderTime } from '../lib/notifications';
import { useHabitStore } from '../store/useHabitStore';

export default function NotificationSettingsScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
    const [time, setTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const enabled = await AsyncStorage.getItem('dailyReminderEnabled');
                if (enabled !== null) setDailyReminderEnabled(enabled === 'true');

                const raw = await AsyncStorage.getItem('dailyReminderTime');
                if (raw) {
                    const [hourStr, minuteStr] = raw.split(':');
                    const d = new Date();
                    d.setHours(parseInt(hourStr, 10));
                    d.setMinutes(parseInt(minuteStr, 10));
                    d.setSeconds(0);
                    setTime(d);
                }
            } catch (e) {
                console.warn('[Settings] Failed to load notification settings', e);
            }
        })();
    }, []);

    const reschedule = async () => {
        const storeHabits = useHabitStore.getState().habits;
        await updateHabitReminders(storeHabits);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton]}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>{t('notifications.settingsTitle')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={[styles.settingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{t('notifications.dailyReminder')}</Text>
                            <TouchableOpacity onPress={() => setShowPicker(true)} style={{ paddingVertical: 6 }}>
                                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                                    {t('notifications.reminderAt', { time: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}` })}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Switch
                            value={dailyReminderEnabled}
                            onValueChange={async (val) => {
                                setDailyReminderEnabled(val);
                                try {
                                    await AsyncStorage.setItem('dailyReminderEnabled', val ? 'true' : 'false');
                                    if (!val) {
                                        await Notifications.cancelAllScheduledNotificationsAsync();
                                    } else {
                                        await reschedule();
                                    }
                                } catch (e) {
                                    console.warn('[Settings] Failed to update reminder enabled', e);
                                }
                            }}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>
                <View style={[styles.settingCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, marginTop: 12 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{t('notifications.changeTimeTitle')}</Text>
                            <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>{t('notifications.changeTimeDesc')}</Text>
                        </View>
                    </View>
                </View>
                {showPicker && (
                    <DateTimePicker
                        value={time}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={async (_, selected) => {
                            setShowPicker(false);
                            if (!selected) return;
                            const newDate = selected as Date;
                            setTime(newDate);
                            try {
                                await setStoredReminderTime(newDate.getHours(), newDate.getMinutes());
                                if (dailyReminderEnabled) await reschedule();
                            } catch (e) {
                                console.warn('[Settings] Failed to save reminder time', e);
                            }
                        }}
                    />
                )}
            </View>
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
        paddingBottom: 20,
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
    title: {
        fontSize: 20,
        fontFamily: fonts.bold,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    settingCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontFamily: fonts.bold,
        marginBottom: 4,
    },
    settingDesc: {
        fontSize: 14,
        fontFamily: fonts.regular,
        lineHeight: 20,
    }
});
