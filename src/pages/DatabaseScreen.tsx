import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { fonts } from '../assets/fonts/fonts';
import { RootStackParamList } from '../assets/types/navigationTypes';
import CustomButton from '../components/CustomButton';
import { backupDatabase, restoreDatabase, restoreDatabaseManually, exportDatabaseManually } from '../assets/data/backup';
import { showErrorToast, showSuccessToast, showWarningToast } from '../lib/toast';

export default function DatabaseScreen() {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [loadingBackup, setLoadingBackup] = useState(false);
    const [loadingExport, setLoadingExport] = useState(false);
    const [loadingRestore, setLoadingRestore] = useState(false);
    const [loadingManualRestore, setLoadingManualRestore] = useState(false);

    const onBackup = async () => {
        setLoadingBackup(true);
        try {
            const ok = await backupDatabase();
            if (ok) {
                showSuccessToast('Backup completed successfully.', 'Backup');
            } else {
                showErrorToast('Backup failed.', 'Backup');
            }
        } catch (err) {
            showErrorToast('Backup failed.', 'Backup');
        } finally {
            setLoadingBackup(false);
        }
    };

    const confirmAndRestore = () => {
        showWarningToast('Restoring will overwrite the current database. Continue?', 'Restore database');
        // If there was a real confirmation mechanism, it would call onRestore here
        // For now we keep it the same as it was in SettingsScreen
        onRestore();
    };

    const onRestore = async () => {
        setLoadingRestore(true);
        try {
            const ok = await restoreDatabase();
            if (ok) {
                showSuccessToast('Database restored from backup.', 'Restore');
            } else {
                showErrorToast('Restore failed or no backup found.', 'Restore');
            }
        } catch (err) {
            showErrorToast('Restore failed.', 'Restore');
        } finally {
            setLoadingRestore(false);
        }
    };

    const onRestoreManually = async () => {
        setLoadingManualRestore(true);
        try {
            const ok = await restoreDatabaseManually();
            if (ok) {
                showSuccessToast('Database restored manually.', 'Restore');
            } else {
                // Not showing error here because it might be just cancelled by user
            }
        } catch (err) {
            showErrorToast('Manual restore failed.', 'Restore');
        } finally {
            setLoadingManualRestore(false);
        }
    };

    const onExport = async () => {
        setLoadingExport(true);
        try {
            const ok = await exportDatabaseManually();
            if (ok) {
                showSuccessToast('Database exported successfully.', 'Export');
            } else {
                // User might have cancelled
            }
        } catch (err) {
            showErrorToast('Failed to export database.', 'Export');
        } finally {
            setLoadingExport(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('settings.database')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                    {t('settings.databaseDesc')}
                </Text>

                <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <CustomButton
                        onPress={onBackup}
                        title={t('settings.backupDb')}
                        loading={loadingBackup}
                        style={styles.button}
                    />

                    <CustomButton
                        onPress={onExport}
                        title={t('settings.exportDb')}
                        loading={loadingExport}
                        style={styles.button}
                        variant="outline"
                    />

                    <CustomButton
                        onPress={confirmAndRestore}
                        title={t('settings.restoreDbAuto')}
                        loading={loadingRestore}
                        style={styles.button}
                        variant="outline"
                    />

                    <CustomButton
                        onPress={onRestoreManually}
                        title={t('settings.restoreDbManual')}
                        loading={loadingManualRestore}
                        style={styles.button}
                        variant="outline"
                    />
                </View>

                <Text style={[styles.manualDesc, { color: theme.colors.textSecondary }]}>
                    {t('settings.databaseManualDesc')}
                </Text>

                <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={styles.infoRow}>
                        <Ionicons name="folder-open-outline" size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                            {t('settings.defaultSaveLocation')}
                        </Text>
                    </View>
                    <Text style={[styles.pathText, { color: theme.colors.textSecondary }]}>
                        {t('settings.internalStorage')}
                    </Text>
                </View>
            </ScrollView>
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
        paddingTop: 10,
        paddingBottom: 20,
        marginTop: 32
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 15,
        fontFamily: fonts.medium,
        marginBottom: 24,
        lineHeight: 22,
    },
    section: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    button: {
        marginTop: 10,
    },
    manualDesc: {
        fontSize: 13,
        fontFamily: fonts.regular,
        textAlign: 'center',
        paddingHorizontal: 10,
        marginTop: 4,
        marginBottom: 24,
    },
    infoCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        fontFamily: fonts.medium,
    },
    pathText: {
        fontSize: 12,
        fontFamily: fonts.regular,
    }
});
