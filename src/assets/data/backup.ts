import * as FileSystem from 'expo-file-system';

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
            console.warn('No database file found at', dbPath, '- cannot back up.');
            return false;
        }

        // Safety: only backup if the file has content
        if (dbInfo.size === 0) {
            console.warn('Main database is empty, skipping backup to prevent overwriting good backups.');
            return false;
        }

        await FileSystem.copyAsync({ from: dbPath, to: backupPath });
        console.log(`Database backup created successfully (${dbInfo.size} bytes).`);
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
        const backupInfo = await FileSystem.getInfoAsync(backupPath);

        if (!backupInfo.exists) {
            console.warn('No backup found! Cannot restore.');
            return false;
        }

        // CRITICAL SAFETY: Don't restore if the backup file is empty
        if (backupInfo.size === 0) {
            console.error('Backup file is empty! Aborting restore to prevent data loss.');
            return false;
        }

        await FileSystem.copyAsync({ from: backupPath, to: dbPath });

        console.log(`Database restored from backup (${backupInfo.size} bytes).`);
        return true;
    }
    catch (error) {
        console.error('Failed to restore database:', error);
        return false;
    }
};

export const checkAndRestoreDatabase = async () => {
    // This function is currently disabled in database.ts init to prevent accidental wipes.
    // It can be manually called if needed, or re-enabled with caution.
    const dbExists = await FileSystem.getInfoAsync(dbPath);
    console.log('Checking if DB exists at', dbPath, 'exists:', dbExists.exists);

    if (!dbExists.exists) {
        console.warn('Database is missing! Attempting to restore from backup...');
        const restored = await restoreDatabase();
        if (!restored) {
            console.error('Could not restore database from backup.');
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
    backupDatabase().catch(() => { });
    _backupIntervalId = setInterval(() => {
        backupDatabase().catch(() => { });
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