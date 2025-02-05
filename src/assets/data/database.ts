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
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );`
  );
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS habit_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habit_id INTEGER NOT NULL,
          progress INTEGER NOT NULL DEFAULT 0,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (habit_id) REFERENCES habits(id)
        );`
  );
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS recycle_bin (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habit_id INTEGER NOT NULL,
          deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (habit_id) REFERENCES habits(id)
        );`
  );
};

export const addHabit = async (name: string, categoryId: number) => {
  const db = await dbPromise;
  await db.runAsync("INSERT INTO habits (name, category_id) VALUES (?, ?);", [name, categoryId]);
};

// Function to update a habit
export const updateHabit = async (id: number, name: string, categoryId: number) => {
  const db = await dbPromise;
  await db.runAsync("UPDATE habits SET name = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;", [name, categoryId, id]);
};

// Function to delete (move habit to recycle bin)
export const deleteHabit = async (id: number) => {
  const db = await dbPromise;
  await db.runAsync("INSERT INTO recycle_bin (habit_id) VALUES (?);", [id]);
  await db.runAsync("DELETE FROM habits WHERE id = ?;", [id]);
};

// Function to fetch progress
export const getProgress = async () => {
  const db = await dbPromise;
  const rows = await db.getAllAsync(`
      SELECT habit_id, SUM(progress) AS total_progress, date 
      FROM habit_progress 
      GROUP BY habit_id, date 
      ORDER BY date DESC;
    `);
  return rows;
};

export const addCategory = async (categoryName: string): Promise<void> => {
  const db = await dbPromise;
  await db.runAsync(
    "INSERT INTO categories (name, created_at) VALUES (?, datetime('now'))",
    [categoryName]
  );
};

export const getCategories = async (): Promise<{ id: number; name: string; created_at: string }[]> => {
  const db = await dbPromise;
  const result = await db.getAllAsync("SELECT * FROM categories ORDER BY created_at DESC");
  return result as { id: number; name: string; created_at: string }[];
}