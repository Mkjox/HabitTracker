import { addHabit, updateHabit, getHabits, deleteHabit, restoreHabit, getProgress, addCategory, getCategories, cleanRecycleBin } from '../data/database';

export const createHabit = async (name: string, categoryId: number): Promise<void> => {
  try {
    await addHabit(name, categoryId);
  } catch (error) {
    console.error("Error adding habit:", error);
    throw new Error("Failed to add habit.");
  }
};

export const editHabit = async (id: number, name: string, categoryId: number): Promise<void> => {
  try {
    await updateHabit(id, name, categoryId);
  } catch (error) {
    console.error("Error updating habit:", error);
    throw new Error("Failed to update habit.");
  }
};

export const fetchHabits = async (): Promise<{ id: number; name: string; category_id: number }[]> => {
  try {
    return await getHabits();
  }
  catch (error) {
    console.error("Error fetching habits:", error);
    throw new Error("Failed to retrieve habits.");
  }
};

export const removeHabit = async (id: number): Promise<void> => {
  try {
    await deleteHabit(id);
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw new Error("Failed to delete habit.");
  }
};

export const recoverHabit = async (id: number): Promise<void> => {
  try {
    await restoreHabit(id);
  } catch (error) {
    console.error("Error restoring habit:", error);
    throw new Error("Failed to restore habit.");
  }
};

export const fetchHabitProgress = async (): Promise<{ habit_id: number; total_progress: number; date: string }[]> => {
  try {
    return await getProgress();
  } catch (error) {
    console.error("Error fetching progress:", error);
    throw new Error("Failed to retrieve habit progress.");
  }
};

export const createCategory = async (categoryName: string): Promise<void> => {
  try {
    await addCategory(categoryName);
  } catch (error) {
    console.error("Error adding category:", error);
    throw new Error("Failed to add category.");
  }
};

export const fetchCategories = async (): Promise<{ id: number; name: string; created_at: string }[]> => {
  try {
    return await getCategories();
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to retrieve categories.");
  }
};

export const cleanupRecycleBin = async (): Promise<void> => {
  try {
    await cleanRecycleBin();
  } catch (error) {
    console.error("Error cleaning recycle bin:", error);
    throw new Error("Failed to clean recycle bin.");
  }
};
