import * as SQLite from 'expo-sqlite';
import { checkAndRestoreDatabase, backupDatabase } from './backup';
import { Habit, Progress, RecycleBinEntry } from './types';

const dbPromise = SQLite.openDatabaseAsync("habits.db");

export const initializeDatabase = async () => {
  await checkAndRestoreDatabase();
  const db = await dbPromise;

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
};

export const addHabit = async (name: string, categoryId: number) => {
  const db = await dbPromise;
  await db.runAsync("INSERT INTO habits (name, category_id) VALUES (?, ?);", [name, categoryId]);
  await backupDatabase();
};

export const updateHabit = async (id: number, name: string, categoryId: number) => {
  const db = await dbPromise;
  await db.runAsync("UPDATE habits SET name = ?, category_id = ? WHERE id = ?;", [name, categoryId, id]);
  await backupDatabase();
};

export const getHabits = async (): Promise<{ id: number; name: string; category_id: number }[]> => {
  const db = await dbPromise;
  const rows = await db.getAllAsync("SELECT * FROM habits;");
  return rows as { id: number; name: string; category_id: number }[];
};

export const deleteHabit = async (id: number) => {
  const db = await dbPromise;
  await db.execAsync("BEGIN TRANSACTION;");
  try {
    const habit = await db.getFirstAsync("SELECT name FROM habits WHERE id = ?;", [id]);
    if (habit) {
      await db.runAsync("INSERT INTO recycle_bin (habit_id, habit_name) VALUES (?, ?);", [id, habit.name]);
      await db.runAsync("DELETE FROM habits WHERE id = ?;", [id]);
      await backupDatabase();
    }
    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    console.error("Error deleting habit:", error);
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

    await db.runAsync("DELETE FROM habits WHERE id = ?;", [habitId]);
    await db.runAsync("DELETE FROM recycle_bin WHERE habit_id = ?;", [habitId]);
    await backupDatabase();

    console.log(`Habit ${habitId} permamently deleted.`);
  }
  catch (error) {
    console.error("Error deleting habit permamently:", error);
  }
};

export const getDeletedHabits = async () => {
  try {
    const db = await dbPromise;
    const rows = await db.getAllAsync(`
      SELECT rb.habit_id AS id, rb.deleted_at, h.name
      FROM recycle_bin rb
      LEFT JOIN habits h ON rb.habit_id = h.id
      ORDER BY rb.deleted_at DESC;
    `);

    return rows.map(item => ({
      ...item,
      name: item.name || 'Deleted Habit'
    }));
  } catch (error) {
    console.error("Error fetching deleted habits:", error);
    return [];
  }
}

export const restoreHabit = async (id: number) => {
  const db = await dbPromise;

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
    "INSERT INTO habits (id, name, added_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'));",
    [id, habitToRestore.habit_name]
  );

  // Remove from recycle_bin table
  await db.runAsync("DELETE FROM recycle_bin WHERE habit_id = ?;", [id]);
  await backupDatabase();
};

export const cleanRecycleBin = async () => {
  const db = await dbPromise;
  await db.runAsync(
    `DELETE FROM recycle_bin 
    WHERE datetime(deleted_at) <= datetime('now', '-30 days');`
  );
  await backupDatabase();
};

export const addProgress = async (habitId: number, p0: number, formattedDate?: string) => {
  const db = await dbPromise;
  await db.runAsync(
    `INSERT OR REPLACE INTO habit_progress (habit_id, date, completed) 
     VALUES (?, date('now', 'localtime'), 1);`, 
    [habitId]
  );
};

export const getProgressByHabitId = async (habitId: number) => {
  const db = await dbPromise;
  try {
    const results = await db.execAsync(
      `SELECT id, date, completed AS total_progress 
       FROM habit_progress 
       WHERE habit_id = ? 
       ORDER BY date DESC;`,
      [habitId]
    );
    return results.rows._array;
  } catch (error) {
    console.error("Error fetching progress:", error);
    return [];
  }
};

export const getProgress = async (): Promise<{ habit_id: number; total_progress: number; date: string }[]> => {
  const db = await dbPromise;
  const rows = await db.getAllAsync(`
    SELECT 
      habit_id, 
      CAST(COALESCE(SUM(progress), 0) AS INTEGER) AS total_progress, 
      strftime('%Y-%m-%d', date) AS date 
    FROM habit_progress 
    GROUP BY habit_id, date 
    ORDER BY habit_id ASC, date DESC;
    `);
  return rows as { habit_id: number; total_progress: number; date: string }[];
};

export const removeProgress = async (habitId: number, formattedDate: string) => {
  const db = await dbPromise;
  await db.runAsync(
    `DELETE FROM habit_progress 
     WHERE habit_id = ? AND date = ?;`, 
    [habitId, formattedDate]
  );
};

export const addCategory = async (categoryName: string): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync("INSERT INTO categories (name) VALUES (?);", [categoryName]);
  await backupDatabase();
};

export const getCategories = async (): Promise<{ id: number; name: string; created_at: string }[]> => {
  const db = await dbPromise;
  const result = await db.getAllAsync("SELECT * FROM categories ORDER BY created_at DESC");
  return result as { id: number; name: string; created_at: string }[];
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync("DELETE FROM categories WHERE id = ?;", [categoryId]);
  await backupDatabase();
};