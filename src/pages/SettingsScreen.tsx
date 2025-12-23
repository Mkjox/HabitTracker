import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Divider } from 'react-native-paper';
import DesignButton from '../components/DesignButton';
import { backupDatabase, restoreDatabase } from '../assets/data/backup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../assets/colors/colors';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function SettingsScreen() {
    const { isDark } = useTheme();
    const [loadingBackup, setLoadingBackup] = useState(false);
    const [loadingRestore, setLoadingRestore] = useState(false);

    const themeStyles = isDark ? darkTheme : lightTheme;

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
        <SafeAreaView style={[styles.container, themeStyles.container]}>
            <View style={styles.top}>
                <View style={styles.topSection}>
                    <Text style={[styles.title, themeStyles.text]}>Settings</Text>
                </View>

                <Divider style={{ marginVertical: 12 }} />

                <Text style={[styles.subTitle, themeStyles.text]}>Database</Text>

                <DesignButton
                    onPress={onBackup}
                    title="Backup Now"
                    loading={loadingBackup}
                    style={styles.button}
                />

                <DesignButton
                    onPress={confirmAndRestore}
                    title="Restore from Backup"
                    loading={loadingRestore}
                    style={styles.button}
                    variant="outline"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    top: {
        marginTop: height * 0.01
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12
    },
    subTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12
    },
    topSection: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    button: {
        marginTop: 10,
    },
});
