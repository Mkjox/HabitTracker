import { dbPromise } from '../dbConnection';
import { Habit } from '../../types/types';

/**
 * Adds a progress record for a habit on a specific date.
 */
export const addProgress = async (habit_id: number, completedCount: number, date: string, customValue?: string) => {
  const db = await dbPromise;
  try {
    await db.runAsync(
      `INSERT OR REPLACE INTO habit_progress (habit_id, date, completed, custom_value) 
       VALUES (?, ?, 1, ?);`,
      [habit_id, date, customValue || null]
    );
  } catch (error) {
    console.error("Error adding progress:", error);
    throw error;
  }
};

/**
 * Removes a progress record for a habit on a specific date.
 */
export const removeProgress = async (habit_id: number, date: string) => {
  const db = await dbPromise;
  try {
    await db.runAsync(
      `DELETE FROM habit_progress 
       WHERE habit_id = ? AND date = ?;`,
      [habit_id, date]
    );
  } catch (error) {
    console.error("Error removing progress:", error);
    throw error;
  }
};

/**
 * Fetches all progress records for a specific habit.
 */
export const getProgressByHabitId = async (habitId: number) => {
  const db = await dbPromise;
  try {
    const results = await db.getAllAsync(
      `SELECT hp.id, hp.date, hp.completed AS total_progress, hp.custom_value, h.name AS habit_name, h.description AS habit_description
       FROM habit_progress hp
       JOIN habits h ON hp.habit_id = h.id
       WHERE hp.habit_id = ? 
       ORDER BY hp.date DESC;`,
      [habitId]
    );
    return results;
  } catch (error) {
    console.error("Error fetching progress for habit:", error);
    return [];
  }
};

/**
 * Optimized SQL query to calculate current streaks for all habits.
 * A streak is defined as consecutive days of completion ending today or yesterday.
 */
export const getHabitStreaks = async (): Promise<Record<number, number>> => {
  const db = await dbPromise;
  try {
    const rows = await db.getAllAsync(getHabitStreaksQuery()) as { habit_id: number, streak: number }[];

    const streakMap: Record<number, number> = {};
    rows.forEach(row => {
      streakMap[row.habit_id] = row.streak;
    });
    return streakMap;
  } catch (error) {
    console.error("Error calculating streaks in SQL:", error);
    return {};
  }
};

/**
 * Optimized SQL query to get monthly completion counts.
 */
export const getMonthlyStats = async () => {
    const db = await dbPromise;
    try {
        const rows = await db.getAllAsync(`
            SELECT 
                strftime('%Y-%m', date) as month_id,
                strftime('%b', date) as month_label,
                SUM(completed) as total_completed
            FROM habit_progress
            GROUP BY month_id
            ORDER BY month_id ASC;
        `);
        return rows as { month_id: string, month_label: string, total_completed: number }[];
    } catch (error) {
        console.error("Error fetching monthly stats:", error);
        return [];
    }
};

/**
 * Migration helper: Fetches minimal necessary data for the Dashboard.
 */
export const getDashboardData = async () => {
  const db = await dbPromise;
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  
  try {
    const habits = await db.getAllAsync(`
      SELECT 
        h.*, 
        EXISTS(SELECT 1 FROM habit_progress WHERE habit_id = h.id AND date = ?) as completed_today
      FROM habits h
    `, [today]) as (Habit & { completed_today: number })[];
    
    return habits;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return [];
  }
};
/**
 * Fetches completion counts for the current week (Mon-Sun) for all habits.
 */
export const getWeeklyProgress = async (): Promise<Record<number, number>> => {
    const db = await dbPromise;
    try {
        // SQLite's date('now', 'weekday 0', '-6 days') gives Monday of the current week
        const rows = await db.getAllAsync(`
            SELECT habit_id, COUNT(*) as count
            FROM habit_progress
            WHERE date >= date('now', 'localtime', 'weekday 1', '-7 days')
            GROUP BY habit_id;
        `) as { habit_id: number, count: number }[];

        const progressMap: Record<number, number> = {};
        rows.forEach(row => {
            progressMap[row.habit_id] = row.count;
        });
        return progressMap;
    } catch (error) {
        console.error("Error fetching weekly progress:", error);
        return {};
    }
};

/**
 * Fetches global summary statistics.
 */
export const getGlobalStats = async () => {
  const db = await dbPromise;
  try {
    const totalHabits = (await db.getFirstAsync("SELECT COUNT(*) as count FROM habits;")) as { count: number };
    const totalCompletions = (await db.getFirstAsync("SELECT COUNT(*) as count FROM habit_progress;")) as { count: number };
    const bestStreak = (await db.getFirstAsync(`
      WITH streak_data AS (
        ${getHabitStreaksQuery()}
      )
      SELECT MAX(streak) as max_streak FROM streak_data;
    `)) as { max_streak: number };

    return {
      totalHabits: totalHabits.count,
      totalCompletions: totalCompletions.count,
      bestStreak: bestStreak.max_streak || 0
    };
  } catch (error) {
    console.error("Error fetching global stats:", error);
    return { totalHabits: 0, totalCompletions: 0, bestStreak: 0 };
  }
};

/**
 * Helper to reuse the complex streak query.
 */
function getHabitStreaksQuery() {
  return `
    WITH RECURSIVE
      yesterday(d) AS (SELECT date('now', 'localtime', '-1 day')),
      streak_start AS (
        SELECT habit_id, MAX(date) as last_date
        FROM habit_progress
        WHERE date >= (SELECT d FROM yesterday)
        GROUP BY habit_id
      ),
      streak_rec AS (
        SELECT habit_id, last_date as date, 1 as count
        FROM streak_start
        UNION ALL
        SELECT hp.habit_id, hp.date, sc.count + 1
        FROM habit_progress hp
        JOIN streak_rec sc ON hp.habit_id = sc.habit_id 
          AND hp.date = date(sc.date, '-1 day')
      )
    SELECT habit_id, MAX(count) as streak
    FROM streak_rec
    GROUP BY habit_id
  `;
}

/**
 * Fetches all progress records across all habits (used for global consistency maps).
 */
export const getAllProgress = async () => {
    const db = await dbPromise;
    try {
        const rows = await db.getAllAsync(
            `SELECT DISTINCT date FROM habit_progress WHERE completed = 1;`
        );
        return rows as { date: string }[];
    } catch (error) {
        console.error("Error fetching all progress:", error);
        return [];
    }
};

/**
 * Fetches all detailed progress records across all habits.
 */
export const getProgress = async () => {
  const db = await dbPromise;
  try {
    const results = await db.getAllAsync(`
      SELECT hp.id, hp.date, hp.completed AS total_progress, hp.custom_value, h.name AS habit_name
      FROM habit_progress hp
      JOIN habits h ON hp.habit_id = h.id
      ORDER BY hp.date DESC;
    `);
    return results;
  } catch (error) {
    console.error("Error fetching progress:", error);
    return [];
  }
};
