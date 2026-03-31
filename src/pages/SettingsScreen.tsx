import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Divider } from 'react-native-paper';
import CustomButton from '../components/CustomButton';
import { backupDatabase, restoreDatabase } from '../assets/data/backup';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../assets/types/navigationTypes';

export default function SettingsScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>

                {/* Management Section */}
                <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="apps-outline" size={24} color={theme.colors.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Management</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.menuRow}
                        onPress={() => navigation.navigate("Categories" as any)}
                    >
                        <View style={styles.menuLeft}>
                            <Ionicons name="grid-outline" size={22} color={theme.colors.text} />
                            <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Categories</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <Divider style={styles.divider} />

                    <TouchableOpacity 
                        style={styles.menuRow}
                        onPress={() => navigation.navigate("Recycle Bin" as any)}
                    >
                        <View style={styles.menuLeft}>
                            <Ionicons name="trash-outline" size={22} color={theme.colors.text} />
                            <Text style={[styles.menuLabel, { color: theme.colors.text }]}>Recycle Bin</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Database Section */}
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
                        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>HabitTracker v1.0.0</Text>
                    </View>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
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
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        marginVertical: 4,
    }
});
