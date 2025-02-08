import * as SQLite from 'expo-sqlite';

const dbPromise = SQLite.openDatabaseAsync("habits.db");

export const initializeDatabase = async () => {
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
          progress INTEGER NOT NULL DEFAULT 0,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
        );`
  );

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS recycle_bin (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habit_id INTEGER NOT NULL,
          deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
        );`
  );
};

export const addHabit = async (name: string, categoryId: number) => {
  const db = await dbPromise;
  await db.runAsync("INSERT INTO habits (name, category_id) VALUES (?, ?);", [name, categoryId]);
};

export const updateHabit = async (id: number, name: string, categoryId: number) => {
  const db = await dbPromise;
  await db.runAsync("UPDATE habits SET name = ?, category_id = ? WHERE id = ?;", [name, categoryId, id]);
};

export const getHabits = async (): Promise<{ id: number; name: string; category_id: number }[]> => {
  const db = await dbPromise;
  const rows = await db.getAllAsync("SELECT * FROM habits;");
  return rows as { id: number; name: string; category_id: number }[];
};

export const deleteHabit = async (id: number) => {
  const db = await dbPromise;
  await db.runAsync("INSERT INTO recycle_bin (habit_id) VALUES (?);", [id]);
  await db.runAsync("DELETE FROM habits WHERE id = ?;", [id]);
};

export const restoreHabit = async (id: number) => {
  const db = await dbPromise;
  await db.runAsync("DELETE FROM recycle_bin WHERE habit_id = ?;", [id]);
};

export const cleanRecycleBin = async () => {
  const db = await dbPromise;
  await db.runAsync(
    "DELETE FROM recycle_bin WHERE deleted_at <= datetime('now', '-30 days');"
  );
};

export const addProgress = async (habitId: number, progress: number) => {
  const db = await dbPromise;
  await db.runAsync("INSERT INTO habit_progress (habit_id, progress, date) VALUES (?, ?, date('now'));", [habitId, progress])
};

// export const getProgressByHabit = async (habitId: number) => {
//   const db = await dbPromise;
//   const rows = await db.getAllAsync(`
//     SELECT habit_id, SUM(progress) AS total_progress, date 
//     FROM habit_progress 
//     WHERE habit_id = ? 
//     GROUP BY date 
//     ORDER BY date DESC;
//     `, [habitId]);
//   return rows;
// };

export const getProgressByHabit = async (habitId: number) => {
  try {
    const db = await dbPromise;
    const rows = await db.getAllAsync(`
      SELECT habit_id, SUM(progress) AS total_progress, date 
      FROM habit_progress 
      WHERE habit_id = ? 
      GROUP BY date 
      ORDER BY date DESC;
      `, [habitId]);
    return rows[0].rows._array || [];
  }
  catch (error) {
    console.error("Error fetching progress data:", error);
    return [];
  }
};

export const getProgress = async (): Promise<{ habit_id: number; total_progress: number; date: string }[]> => {
  const db = await dbPromise;
  const rows = await db.getAllAsync(`
      SELECT habit_id, COALESCE(SUM(progress), 0) AS total_progress, date 
      FROM habit_progress 
      GROUP BY habit_id, date 
      ORDER BY date DESC;
    `);
  return rows as { habit_id: number; total_progress: number; date: string }[];
  // return rows.map((row) => ({
  //   ...row,
  //   total_progress: Number(row.total_progress),
  // }));
};

export const addCategory = async (categoryName: string): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync("INSERT INTO categories (name) VALUES (?);", [categoryName]);
};

export const getCategories = async (): Promise<{ id: number; name: string; created_at: string }[]> => {
  const db = await dbPromise;
  const result = await db.getAllAsync("SELECT * FROM categories ORDER BY created_at DESC");
  return result as { id: number; name: string; created_at: string }[];
};
