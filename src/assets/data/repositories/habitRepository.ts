import { Habit, DeletedHabit, HabitFromRecycleBin } from '../../types/types';
import { backupDatabase } from '../backup';
import { dbPromise } from '../dbConnection';

export const addHabit = async (name: string, description: string, categoryId: number, icon: string = 'leaf', frequencyType: 'daily' | 'weekly' | 'custom' = 'daily', frequencyValue: number = 0) => {
  if (!name.trim()) {
    console.error("Error: Habit name cannot be empty.");
    return;
  }

  const db = await dbPromise;
  try {
    console.log(`[DB] Adding habit: name="${name}", description="${description}", categoryId=${categoryId}, icon=${icon}`);
    const result = await db.runAsync(
      "INSERT INTO habits (name, description, category_id, icon, frequency_type, frequency_value) VALUES (?, ?, ?, ?, ?, ?);", 
      [name, description, categoryId, icon, frequencyType, frequencyValue]
    );
    console.log(`[DB] Habit added successfully. Insert ID: ${result.lastInsertRowId}`);
    await backupDatabase();
  } catch (error) {
    console.error('[DB] Error adding habit:', error);
    throw error;
  }
};

export const updateHabit = async (id: number, name: string, description: string, categoryId: number, icon: string, frequencyType: 'daily' | 'weekly' | 'custom' = 'daily', frequencyValue: number = 0) => {
  const db = await dbPromise;
  try {
    console.log(`[DB] Updating habit ${id}: name="${name}", description="${description}", categoryId=${categoryId}, icon=${icon}`);
    const result = await db.runAsync(
      "UPDATE habits SET name = ?, description = ?, category_id = ?, icon = ?, frequency_type = ?, frequency_value = ? WHERE id = ?;", 
      [name, description, categoryId, icon, frequencyType, frequencyValue, id]
    );
    console.log(`[DB] Habit updated successfully. Rows affected: ${result.changes}`);
    await backupDatabase();
  } catch (error) {
    console.error('[DB] Error updating habit:', error);
    throw error;
  }
};

export const getHabits = async (): Promise<{ id: number; name: string; description: string; category_id: number; icon: string }[]> => {
  const db = await dbPromise;
  try {
    const rows = await db.getAllAsync("SELECT * FROM habits;");
    return rows as { id: number; name: string; description: string; category_id: number; icon: string }[];
  } catch (error) {
    console.error('Error fetching habits:', error);
    return [];
  }
};

export const deleteHabit = async (habitId: number): Promise<void> => {
  const db = await dbPromise;

  try {
    await db.execAsync("BEGIN TRANSACTION;");

    const habit = (await db.getFirstAsync("SELECT id, name, description, category_id, icon FROM habits WHERE id = ?;", [habitId])) as (Habit & { icon: string }) | null;

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

    await db.runAsync(
      "INSERT INTO recycle_bin (habit_id, habit_name, habit_description, category_id, icon, frequency_type, frequency_value, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'));",
      [habitId, habit.name, habit.description, habit.category_id, habit.icon, habit.frequency_type, habit.frequency_value]
    );

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

    await db.runAsync("DELETE FROM recycle_bin WHERE habit_id = ?;", [habitId]);
    await backupDatabase();

    console.log(`Habit ${habitId} permanently deleted.`);
  } catch (error) {
    console.error("Error deleting habit permanently:", error);
  }
};

export const getDeletedHabits = async (): Promise<DeletedHabit[]> => {
  try {
    const db = await dbPromise;
    const rows: { id: number; deleted_at: string; habit_name: string, category_id: number }[] = await db.getAllAsync(`
      SELECT habit_id AS id, deleted_at, habit_name, category_id
      FROM recycle_bin
      ORDER BY deleted_at DESC;
    `);

    return rows.map((item) => ({
      id: item.id,
      deleted_at: item.deleted_at,
      name: item.habit_name,
      category_id: item.category_id
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
      "SELECT habit_name, habit_description, category_id, icon FROM recycle_bin WHERE habit_id = ?;",
      [id]
    ) as (HabitFromRecycleBin & { icon: string }) | null;

    if (!habitToRestore) {
      console.warn(`No habit found in the recycle bin with id: ${id}`);
      return;
    }

    await db.runAsync(
      "INSERT INTO habits (name, description, category_id, icon, added_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'));",
      [habitToRestore.habit_name, habitToRestore.habit_description, habitToRestore.category_id, habitToRestore.icon]
    );

    await db.runAsync("DELETE FROM recycle_bin WHERE habit_id = ?;", [id]);
    await backupDatabase();
  } catch (error) {
    console.error("Error restoring habit:", error);
  }
};

export const cleanRecycleBin = async () => {
  const db = await dbPromise;
  try {
    console.log('[DB] Cleaning recycle bin - deleting all items');
    const result = await db.runAsync('DELETE FROM recycle_bin;');
    console.log(`[DB] Recycle bin cleaned. Rows deleted: ${result.changes}`);
    await backupDatabase();
  } catch (error) {
    console.error('[DB] Error cleaning recycle bin:', error);
    throw error;
  }
};
