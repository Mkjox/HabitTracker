import { create } from 'zustand';
import { 
  getDashboardData, 
  getHabitStreaks, 
  addProgress, 
  removeProgress, 
  addHabit as addHabitDb,
  deleteHabit as deleteHabitDb,
  getCategories,
  addCategory as addCategoryDb,
  deleteCategory as deleteCategoryDb,
  getWeeklyProgress
} from '../assets/data/database';
import { DashboardHabit, Category } from '../assets/types/types';
import { hapticFeedback } from '../lib/haptics';
import { updateHabitReminders } from '../lib/notifications';
import { updateWidgetData } from '../lib/widgetService';

interface HabitState {
  habits: DashboardHabit[];
  categories: Category[];
  weeklyProgress: Record<number, number>;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleHabit: (habitId: number) => Promise<void>;
  addHabit: (name: string, description: string, categoryId: number, icon: string, frequencyType?: 'daily' | 'weekly' | 'custom', frequencyValue?: number) => Promise<void>;
  removeHabit: (habitId: number) => Promise<void>;
  
  // Category Actions
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  removeCategory: (id: number) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  categories: [],
  weeklyProgress: {},
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    await Promise.all([
      get().refresh(),
      get().fetchCategories()
    ]);
    set({ initialized: true });
  },

  refresh: async () => {
    set({ loading: true });
    try {
      const [baseData, streakData, weeklyData] = await Promise.all([
        getDashboardData(),
        getHabitStreaks(),
        getWeeklyProgress()
      ]);

      const merged: DashboardHabit[] = (baseData as any).map((h: any) => ({
        ...h,
        streak: streakData[h.id] || 0,
        completedToday: !!h.completed_today
      }));

      set({ 
        habits: merged, 
        weeklyProgress: weeklyData,
        loading: false 
      });
      await updateHabitReminders(merged);
      await updateWidgetData(merged);
    } catch (error) {
      console.error("[Store] Error refreshing habits:", error);
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const data = await getCategories();
      set({ categories: data });
    } catch (error) {
      console.error("[Store] Error fetching categories:", error);
    }
  },

  addCategory: async (name: string) => {
    try {
      await addCategoryDb(name);
      await get().fetchCategories();
    } catch (error) {
      console.error("[Store] Error adding category:", error);
      throw error;
    }
  },

  removeCategory: async (id: number) => {
    try {
      await deleteCategoryDb(id);
      await get().fetchCategories();
    } catch (error) {
      console.error("[Store] Error removing category:", error);
      throw error;
    }
  },

  toggleHabit: async (habitId: number) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().slice(0, 10);
    const wasCompleted = habit.completedToday;

    // 1. Optimistic Update
    const newCompleted = !wasCompleted;
    const newStreak = wasCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1;
    
    set({
      habits: habits.map(h => 
        h.id === habitId 
          ? { ...h, completedToday: newCompleted, streak: newStreak } 
          : h
      )
    });

    // Update notifications and widgets based on new state
    await updateHabitReminders(get().habits);
    await updateWidgetData(get().habits);

    // 2. Persistent Update
    try {
      if (wasCompleted) {
        await removeProgress(habitId, today);
        hapticFeedback.selection();
      } else {
        await addProgress(habitId, 1, today);
        hapticFeedback.success();
      }
      // Re-fetch to sync exactly with database (in case of multi-log edge cases)
      const streakData = await getHabitStreaks();
      set({
        habits: get().habits.map(h => 
          h.id === habitId ? { ...h, streak: streakData[habitId] || 0 } : h
        )
      });
    } catch (error) {
      console.error("[Store] Error toggling habit:", error);
      // Rollback on error
      set({ habits });
    }
  },

  addHabit: async (name: string, description: string, categoryId: number, icon: string, frequencyType: 'daily' | 'weekly' | 'custom' = 'daily', frequencyValue: number = 0) => {
    try {
      await addHabitDb(name, description, categoryId, icon, frequencyType, frequencyValue);
      await get().refresh();
    } catch (error) {
      console.error("[Store] Error adding habit:", error);
    }
  },

  removeHabit: async (habitId: number) => {
    try {
      await deleteHabitDb(habitId);
      await get().refresh();
    } catch (error) {
      console.error("[Store] Error removing habit:", error);
    }
  }
}));
