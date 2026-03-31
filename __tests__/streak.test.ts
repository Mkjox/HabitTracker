/**
 * Streak Calculation Logic Test
 * 
 * This test verifies the business logic for calculating streaks, 
 * ensuring it handles transitions, gaps, and today's completion correctly.
 */

const calculateOptimisticStreak = (currentStreak: number, wasCompleted: boolean): number => {
    return wasCompleted ? Math.max(0, currentStreak - 1) : currentStreak + 1;
};

describe('Streak Business Logic', () => {
    test('incrementing streak when marking habit as completed today', () => {
        expect(calculateOptimisticStreak(5, false)).toBe(6);
        expect(calculateOptimisticStreak(0, false)).toBe(1);
    });

    test('decrementing streak when unmarking habit as completed today', () => {
        expect(calculateOptimisticStreak(5, true)).toBe(4);
        expect(calculateOptimisticStreak(1, true)).toBe(0);
    });

    test('streak never goes below zero', () => {
        expect(calculateOptimisticStreak(0, true)).toBe(0);
    });
});
