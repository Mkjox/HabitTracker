import * as SQLite from 'expo-sqlite';
import { checkAndRestoreDatabase, backupDatabase } from './backup';
import { Habit, Progress, RecycleBinEntry } from './types';

const dbPromise = SQLite.openDatabaseAsync("habits.db");

export const initializeDatabase = async () => {
  await checkAndRestoreDatabase();
  const db = await dbPromise;
  await db.execAsync("PRAGMA foreign_keys = ON;");

  try {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category_id INTEGER,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
          );`
    );

    await db.execAsync(
      `CREATE TRIGGER IF NOT EXISTS update_habit_timestamp
        AFTER UPDATE ON habits
        FOR EACH ROW
        BEGIN
          UPDATE habits SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END;`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS habit_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            UNIQUE(habit_id, date), 
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
          );`
    );
    await db.execAsync("CREATE INDEX IF NOT EXISTS idx_habit_id_date ON habit_progress(habit_id, date);");

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS recycle_bin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            habit_name TEXT NOT NULL,
            deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
    );
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export const addHabit = async (name: string, categoryId: number) => {
  if (!name.trim()) {
    console.error("Error: Habit name cannot be empty.");
    return;
  }

  const db = await dbPromise;
  try {
    await db.runAsync("INSERT INTO habits (name, category_id) VALUES (?, ?);", [name, categoryId]);
    await backupDatabase();
  } catch (error) {
    console.error('Error adding habit:', error);
  }
};



export const updateHabit = async (id: number, name: string, categoryId: number) => {
  const db = await dbPromise;
  try {
    await db.runAsync("UPDATE habits SET name = ?, category_id = ? WHERE id = ?;", [name, categoryId, id]);
    await backupDatabase();
  } catch (error) {
    console.error('Error updating habit:', error);
  }
};

export const getHabits = async (): Promise<{ id: number; name: string; category_id: number }[]> => {
  const db = await dbPromise;
  try {
    const rows = await db.getAllAsync("SELECT * FROM habits;");
    return rows as { id: number; name: string; category_id: number }[];
  } catch (error) {
    console.error('Error fetching habits:', error);
    return [];
  }
};

export const deleteHabit = async (habitId: number) => {
  const db = await dbPromise;
  
  try {
    await db.execAsync("BEGIN TRANSACTION;");

    // Fetch habit and log it
    const habit = await db.getFirstAsync("SELECT id, name FROM habits WHERE id = ?;", [habitId]);
    console.log("Fetched habit before deleting:", habit);

    if (!habit) {
      console.warn(`Habit with ID ${habitId} not found.`);
      await db.execAsync("ROLLBACK;");
      return;
    }

    if (!habit.name) {
      console.error("Error: habit.name is NULL! Full habit object:", habit);
      await db.execAsync("ROLLBACK;");
      return;
    }

    // Insert into recycle_bin
    await db.runAsync(
      "INSERT INTO recycle_bin (habit_id, habit_name, deleted_at) VALUES (?, ?, datetime('now'));",
      [habitId, habit.name]
    );

    // Delete from habits table
    await db.runAsync("DELETE FROM habits WHERE id = ?;", [habitId]);

    await db.execAsync("COMMIT;");
    console.log(`Habit ${habitId} moved to recycle_bin successfully.`);
  } catch (error) {
    console.error("Error deleting habit:", error);
    await db.execAsync("ROLLBACK;");
  }
};



export const deleteHabitPermanently = async (habitId: number) => {
  try {
    const db = await dbPromise;

    const deletedHabit = await db.getFirstAsync("SELECT habit_id FROM recycle_bin WHERE habit_id = ?;", [habitId]);

    if (!deletedHabit) {
      console.warn(`Habit ${habitId} is not in the recycle bin.`);
      return;
    }

    // await db.runAsync("DELETE FROM habits WHERE id = ?;", [habitId]);
    await db.runAsync("DELETE FROM recycle_bin WHERE habit_id = ?;", [habitId]);
    await backupDatabase();

    console.log(`Habit ${habitId} permanently deleted.`);
  } catch (error) {
    console.error("Error deleting habit permanently:", error);
  }
};

export const getDeletedHabits = async () => {
  try {
    const db = await dbPromise;
    const rows = await db.getAllAsync(`
      SELECT habit_id AS id, deleted_at, habit_name 
      FROM recycle_bin
      ORDER BY deleted_at DESC;
    `);

    return rows.map(item => ({
      id: item.id,
      deleted_at: item.deleted_at,
      name: item.habit_name // Fetching name from recycle_bin
    }));
  } catch (error) {
    console.error("Error fetching deleted habits:", error);
    return [];
  }
};


export const restoreHabit = async (id: number) => {
  const db = await dbPromise;

  try {
    const habitToRestore = await db.getFirstAsync(
      "SELECT habit_name FROM recycle_bin WHERE habit_id = ?;",
      [id]
    );

    if (!habitToRestore) {
      console.warn(`No habit found in the recycle bin with id: ${id}`);
      return;
    }

    // Insert back into habits table
    await db.runAsync(
      "INSERT INTO habits (name, added_at, updated_at) VALUES (?, datetime('now'), datetime('now'));",
      [habitToRestore.habit_name]
    );

    // Remove from recycle_bin table
    await db.runAsync("DELETE FROM recycle_bin WHERE habit_id = ?;", [id]);
    await backupDatabase();
  } catch (error) {
    console.error("Error restoring habit:", error);
  }
};

export const cleanRecycleBin = async () => {
  const db = await dbPromise;
  try {
    await db.runAsync(
      `DELETE FROM recycle_bin 
      WHERE datetime(deleted_at) <= datetime('now', '-30 days');`
    );
    await backupDatabase();
  } catch (error) {
    console.error("Error cleaning recycle bin:", error);
  }
};

export const addProgress = async (habitId: number, p0: number, formattedDate?: string) => {
  const db = await dbPromise;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO habit_progress (habit_id, date, completed) 
       VALUES (?, ?, 1);`,
      [habitId, formattedDate || "date('now', 'localtime')"]
    );
  } catch (error) {
    console.error("Error adding progress:", error);
  }
};

export const getProgressByHabitId = async (habitId: number) => {
  const db = await dbPromise;
  try {
    const results = await db.getAllAsync(
      `SELECT hp.id, hp.date, hp.completed AS total_progress, h.name AS habit_name
       FROM habit_progress hp
       JOIN habits h ON hp.habit_id = h.id
       WHERE hp.habit_id = ? 
       ORDER BY hp.date DESC;`,
      [habitId]
    );

    // Check if results are empty
    if (!results || results.length === 0) {
      console.warn(`No progress found for habitId: ${habitId}`);
      return []; // Return an empty array if no progress is found
    }

    return results;
  } catch (error) {
    console.error("Error fetching progress:", error);
    return []; // Return an empty array on error
  }
};

export const getProgress = async (): Promise<{ habit_id: number; habit_name: string; total_progress: number; date: string }[]> => {
  const db = await dbPromise;
  const rows = await db.getAllAsync(`
    SELECT 
      hp.habit_id, 
      h.name AS habit_name,
      CAST(COALESCE(SUM(hp.completed), 0) AS INTEGER) AS total_progress, 
      strftime('%Y-%m-%d', hp.date) AS date 
    FROM habit_progress hp
    JOIN habits h ON hp.habit_id = h.id
    GROUP BY hp.habit_id, date 
    ORDER BY hp.habit_id ASC, date DESC;
  `);
  return rows as { habit_id: number; habit_name: string; total_progress: number; date: string }[];
};

export const removeProgress = async (habitId: number, formattedDate: string) => {
  const db = await dbPromise;
  try {
    await db.runAsync(
      `DELETE FROM habit_progress 
       WHERE habit_id = ? AND date = ?;`,
      [habitId, formattedDate]
    );
  } catch (error) {
    console.error("Error removing progress:", error);
  }
};

export const addCategory = async (categoryName: string): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync("INSERT INTO categories (name) VALUES (?);", [categoryName]);
    await backupDatabase();
  } catch (error) {
    console.error('Error adding category:', error);
  }
};

export const getCategories = async (): Promise<{ id: number; name: string; created_at: string }[]> => {
  const db = await dbPromise;
  try {
    const result = await db.getAllAsync("SELECT * FROM categories ORDER BY created_at DESC");
    return result as { id: number; name: string; created_at: string }[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync("DELETE FROM categories WHERE id = ?;", [categoryId]);
    await backupDatabase();
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};