/** Meal row from `meals` after server-side date/time normalization. */
export declare class Meal {
    readonly id: number | undefined;
    readonly userId: number | undefined;
    readonly name: string;
    readonly description: string | null;
    readonly date: string;
    readonly time: string;
    readonly calories: number;
    readonly protein: number;
    readonly carbohydrates: number;
    readonly fats: number;
    readonly isRecurring: boolean;
    constructor(id: number | undefined, userId: number | undefined, name: string, description: string | null, date: string, time: string, calories: number, protein: number, carbohydrates: number, fats: number, isRecurring: boolean);
    static fromDbRow(row: {
        id?: number;
        user_id?: number;
        name: string;
        description: string | null;
        date: Date;
        time: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
        is_recurring?: boolean;
    }): Meal;
    /**
     * Partial row (e.g. recurring template query omits id / is_recurring).
     * Date may still be a `Date` from pg.
     */
    static fromPartialRow(row: {
        id?: number;
        user_id?: number;
        name: string;
        description: string | null;
        date: Date | string;
        time: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
        is_recurring?: boolean;
    }): Meal;
    toJSON(): {
        id?: number;
        user_id?: number;
        name: string;
        description: string | null;
        date: string;
        time: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
        is_recurring: boolean;
    };
}
//# sourceMappingURL=meal.d.ts.map