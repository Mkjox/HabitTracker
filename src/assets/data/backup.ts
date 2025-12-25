import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
// import { useEffect } from 'react';

// async function requestPermissions() {
//     const { status } = await MediaLibrary.requestPermissionsAsync(); // Corrected
//     if (status !== 'granted') {
//         alert('Permission denied');
//     }
// }

// useEffect(() => {
//     requestPermissions();
// }, []);

const dbPath = `${FileSystem.documentDirectory}SQLite/habits.db`;
const backupDir = `${FileSystem.documentDirectory}Backup`;
const backupPath = `${backupDir}/habits_backup.db`;

export const DEFAULT_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

let _backupIntervalId: number | null = null;

async function ensureBackupDir() {
    try {
        const info = await FileSystem.getInfoAsync(backupDir);
        if (!info.exists) {
            await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
        }
    }
    catch (error) {
        console.warn('Could not ensure backup directory:', error);
    }
}

export const backupDatabase = async () => {
    try {
        await ensureBackupDir();
        const dbInfo = await FileSystem.getInfoAsync(dbPath);
        if (!dbInfo.exists) {
            console.warn('No database file to back up.');
            return false;
        }
        await FileSystem.copyAsync({ from: dbPath, to: backupPath });
        console.log('Database backup created successfully.');
        return true;
    }
    catch (error) {
        console.error('Failed to backup database:', error);
        return false;
    }
};

export const restoreDatabase = async () => {
    try {
        console.log('Attempting to restore database from', backupPath, 'to', dbPath);
        const backupExists = await FileSystem.getInfoAsync(backupPath);

        if (!backupExists.exists) {
            console.warn('No backup found! Cannot restore.');
            return false;
        }

        await FileSystem.copyAsync({ from: backupPath, to: dbPath });

        console.log('Database restored from backup.');
        return true;
    }
    catch (error) {
        console.error('Failed to restore database:', error);
        return false;
    }
};

export const checkAndRestoreDatabase = async () => {
    const dbExists = await FileSystem.getInfoAsync(dbPath);
    console.log('Checking if DB exists at', dbPath, 'exists:', dbExists.exists);

    if (!dbExists.exists) {
        console.warn('Database is missing! Attempting to restore...');
        const restored = await restoreDatabase();
        if (!restored) {
            console.error('Could not restore database. Creating a fresh one...');
        }
    }
    return true;
};

export const startAutoBackup = (intervalMs: number = DEFAULT_BACKUP_INTERVAL_MS) => {
    if (_backupIntervalId) {
        console.log('Auto-backup already running.');
        return;
    }
    // Immediately run once, then schedule
    backupDatabase().catch(() => {});
    _backupIntervalId = setInterval(() => {
        backupDatabase().catch(() => {});
    }, intervalMs) as unknown as number;
    console.log('Auto-backup started with interval (ms):', intervalMs);
};

export const stopAutoBackup = () => {
    if (_backupIntervalId) {
        clearInterval(_backupIntervalId);
        _backupIntervalId = null;
        console.log('Auto-backup stopped.');
    }
};