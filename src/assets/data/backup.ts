import * as FileSystem from 'expo-file-system';

const dbPath = `${FileSystem.documentDirectory}SQLite/habits.db`;
const backupPath = `${FileSystem.documentDirectory}Backup/habits_backup.db`;

export const backupDatabase = async () => {
    try {
        await FileSystem.copyAsync({
            from: dbPath, to: backupPath
        });
        console.log("Database backup created successfully.");
    }
    catch (error) {
        console.error("Failed to backup database:", error);
    }
};

export const restoreDatabase = async () => {
    try {
        const backupExists = await FileSystem.getInfoAsync(backupPath);

        if (!backupExists.exists) {
            console.warn("No backup found! Cannot restore.");
            return false;
        }

        await FileSystem.copyAsync({
            from: backupPath,
            to: dbPath
        });

        console.log("Database restored from backup.");
        return true;
    }

    catch (error) {
        console.error("Failed to restore database:", error);
        return false;
    }
};

export const checkAndRestoreDatabase = async () => {
    const dbExists = await FileSystem.getInfoAsync(dbPath);

    if (!dbExists.exists) {
        console.warn("Database is missing! Attempting to restore...");
        const restored = await restoreDatabase();
        if (!restored) {
            console.error("Could not restore database. Creating a fresh one...");
        }
    }
    return true;
};