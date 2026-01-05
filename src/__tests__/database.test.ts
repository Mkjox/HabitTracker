import { openDatabaseAsync } from 'expo-sqlite';
import {
    addHabit,
    updateHabit,
    getHabits,
    deleteHabit,
    restoreHabit,
    cleanRecycleBin,
    addCategory
}
    from '../assets/data/database';
import { afterEach, jest } from '@jest/globals';

const dbMock = {
    runAsync: jest.fn((): Promise<any> => Promise.resolve()),
    getAllAsync: jest.fn((): Promise<any[]> => Promise.resolve([])),
    getFirstAsync: jest.fn((): Promise<any> => Promise.resolve(null)),
    execAsync: jest.fn((): Promise<void> => Promise.resolve())
};

jest.mock('expo-sqlite', () => ({
    openDatabaseAsync: jest.fn(() => Promise.resolve(dbMock))
}));

const mockDBResponse = (method: keyof typeof dbMock, value: any) => {
    dbMock[method].mockResolvedValue(value);
};

afterEach(() => {
    jest.clearAllMocks();
});

describe("Database Operations", () => {
    test("should add a habit", async () => {
        await addHabit("Read Books", "Read 30 minutes daily", 1);
        expect(dbMock.runAsync).toHaveBeenCalledWith(
            "INSERT INTO habits (name, description, category_id) VALUES (?, ?, ?);",
            ["Read Books", "Read 30 minutes daily", 1]
        );
    });

    test("should update an existing habit", async () => {
        await updateHabit(1, "Read More Books", "Read 60 minutes daily", 2);
        expect(dbMock.runAsync).toHaveBeenCalledWith(
            "UPDATE habits SET name = ?, description = ?, category_id = ? WHERE id = ?;",
            ["Read More Books", "Read 60 minutes daily", 2, 1]
        );
    });

    test("should return an empty array when no habits exist", async () => {
        mockDBResponse('getAllAsync', []);
        const habits = await getHabits();
        expect(habits).toEqual([]);
    });

    test("should move a habit to recycle bin", async () => {
        // Mock the habit data that would be fetched
        const mockHabit = { id: 1, name: "Test Habit", description: "Test Description", category_id: 1 };
        dbMock.getFirstAsync = jest.fn(() => Promise.resolve(mockHabit));

        await deleteHabit(1);

        // Verify habit was fetched
        expect(dbMock.getFirstAsync).toHaveBeenCalled();
    });

    test("should restore a habit from recycle bin", async () => {
        await restoreHabit(1);
        expect(dbMock.runAsync).toHaveBeenCalledWith(
            "DELETE FROM recycle_bin WHERE habit_id = ?;",
            [1]
        );
    });

    test("should clean recycle bin older than 30 days", async () => {
        await cleanRecycleBin();
        expect(dbMock.runAsync).toHaveBeenCalledWith(
            "DELETE FROM recycle_bin WHERE deleted_at <= datetime('now', '-30 days');"
        );
    });

    test("should add a new category", async () => {
        await addCategory("Health");
        expect(dbMock.runAsync).toHaveBeenCalledWith(
            "INSERT INTO categories (name) VALUES (?);",
            ["Health"]
        );
    });

    test("should not add duplicate category", async () => {
        dbMock.runAsync.mockRejectedValue(new Error("UNIQUE constraint failed"));
        await expect(addCategory("Duplicate Category")).rejects.toThrow("UNIQUE constraint failed");
    });

    test("should not add habit with invalid category", async () => {
        dbMock.runAsync.mockRejectedValue(new Error("FOREIGN KEY constraint failed"));
        await expect(addHabit("Invalid Habit", "Description", 999)).rejects.toThrow("FOREIGN KEY constraint failed");
    });
});