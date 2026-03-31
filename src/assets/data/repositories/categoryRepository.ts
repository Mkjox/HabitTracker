import { backupDatabase } from '../backup';
import { dbPromise } from '../dbConnection';

export const addCategory = async (categoryName: string): Promise<void> => {
  const db = await dbPromise;
  try {
    console.log(`[DB] Adding category: name="${categoryName}"`);
    const result = await db.runAsync("INSERT INTO categories (name) VALUES (?);", [categoryName]);
    console.log(`[DB] Category added successfully. Insert ID: ${result.lastInsertRowId}`);
    await backupDatabase();
  } catch (error) {
    console.error('[DB] Error adding category:', error);
    throw error;
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
