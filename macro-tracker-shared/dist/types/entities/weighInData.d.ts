/** Weigh-in row from `user_weights` (targets optional for range-only rows). */
export declare class WeighInData {
    readonly date: Date;
    readonly weight: number;
    readonly targetCalories: number | null;
    readonly targetProtein: number | null;
    readonly targetCarbohydrates: number | null;
    readonly targetFats: number | null;
    constructor(date: Date, weight: number, targetCalories?: number | null, targetProtein?: number | null, targetCarbohydrates?: number | null, targetFats?: number | null);
    static fromRangeRow(row: {
        date: Date;
        weight: number;
    }): WeighInData;
    static fromRecentRow(row: {
        date: Date;
        weight: number;
        target_calories: number | null;
        target_protein: number | null;
        target_carbohydrates: number | null;
        target_fats: number | null;
    }): WeighInData;
    /** Range list item: ISO date string + weight. */
    toRangeJSON(): {
        date: string;
        weight: number;
    };
    /** Recent endpoint: camelCase targets. */
    toRecentJSON(): {
        date: string;
        weight: number;
        targetCalories: number | null;
        targetProtein: number | null;
        targetCarbohydrates: number | null;
        targetFats: number | null;
    };
}
//# sourceMappingURL=weighInData.d.ts.map