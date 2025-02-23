export type Habit = {
    id: number;
    name: string;
    category: string;
    startDate: string;
  };
  
  export type Progress = {
    id: number;
    habit_id: number;
    date: string;
    total_progress: number;
  };
  
    export type RecycleBinEntry = {
    habit_id: number;
    habit_name: string;
    deleted_at: string;
  };