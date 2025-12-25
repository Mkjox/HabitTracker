import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Divider } from 'react-native-paper';
import CustomButton from '../components/CustomButton';
import { backupDatabase, restoreDatabase } from '../assets/data/backup';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { theme } = useTheme();
    const [loadingBackup, setLoadingBackup] = useState(false);
    const [loadingRestore, setLoadingRestore] = useState(false);

    const onBackup = async () => {
        setLoadingBackup(true);
        try {
            const ok = await backupDatabase();
            Alert.alert('Backup', ok ? 'Backup completed successfully.' : 'Backup failed.');
        } catch (err) {
            Alert.alert('Backup', 'Backup failed.');
        } finally {
            setLoadingBackup(false);
        }
    };

    const confirmAndRestore = () => {
        Alert.alert(
            'Restore database',
            'Restoring will overwrite the current database. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Restore', style: 'destructive', onPress: onRestore }
            ]
        );
    };

    const onRestore = async () => {
        setLoadingRestore(true);
        try {
            const ok = await restoreDatabase();
            Alert.alert('Restore', ok ? 'Database restored from backup.' : 'Restore failed or no backup found.');
        } catch (err) {
            Alert.alert('Restore', 'Restore failed.');
        } finally {
            setLoadingRestore(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

                <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="server-outline" size={24} color={theme.colors.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Database</Text>
                    </View>
                    <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
                        Backup your habits and progress to a local file or restore from a previous backup.
                    </Text>

                    <CustomButton
                        onPress={onBackup}
                        title="Backup Database"
                        loading={loadingBackup}
                        style={styles.button}
                    />

                    <CustomButton
                        onPress={confirmAndRestore}
                        title="Restore Database"
                        loading={loadingRestore}
                        style={styles.button}
                        variant="outline"
                    />
                </View>

                <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Version 1.0.0</Text>
                    </View>
                </View>
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
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 24,
    },
    section: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    sectionDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    button: {
        marginTop: 10,
    },
    infoCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '500',
    }
});
