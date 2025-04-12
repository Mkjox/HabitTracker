export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Habit {
  id: number;
  name: string;
  description: string;
  category_id: number | null;
  added_at: string;
  updated_at: string;
}

export interface HabitProgress {
  id: number;
  habit_id: number;
  date: string;
  completed: number;
  custom_value?: string | null;
}

export interface RecycleBinEntry {
  id: number;
  habit_id: number;
  habit_name: string;
  deleted_at: string;
}

export type DeletedHabit = {
  id: number;
  deleted_at: string;
  name: string;
  category_id: number;
};

export type HabitFromRecycleBin = {
  habit_name: string;
  habit_description: string;
  category_id: number;
};

// export type Database = SQLite.WebSQLDatabase;

export type InitializeDatabase = () => Promise<void>;

export type AddHabit = (name: string, categoryId: number) => Promise<void>;

export type UpdateHabit = (id: number, name: string, categoryId: number) => Promise<void>;

export type GetHabits = () => Promise<Habit[]>;

export type DeleteHabit = (habitId: number) => Promise<void>;

export type DeleteHabitPermanently = (habitId: number) => Promise<void>;

export type GetDeletedHabits = () => Promise<RecycleBinEntry[]>;

export type RestoreHabit = (id: number) => Promise<void>;

export type CleanRecycleBin = () => Promise<void>;

export type AddProgress = (habitId: number, p0: number, formattedDate?: string) => Promise<void>;

export type GetProgressByHabitId = (habitId: number) => Promise<HabitProgress[]>;

export type GetProgress = () => Promise<
  { habit_id: number; habit_name: string; total_progress: number; date: string }[]
>;

export type RemoveProgress = (habitId: number, formattedDate: string) => Promise<void>;

export type AddCategory = (categoryName: string) => Promise<void>;

export type GetCategories = () => Promise<Category[]>;

export type DeleteCategory = (categoryId: number) => Promise<void>;