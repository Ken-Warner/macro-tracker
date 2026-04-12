/** One day of macro totals from `macro_totals`. */
export declare class MacroData {
    readonly date: string | undefined;
    readonly calories: number;
    readonly protein: number;
    readonly carbohydrates: number;
    readonly fats: number;
    constructor(date: string | undefined, calories: number, protein: number, carbohydrates: number, fats: number);
    static fromDbRow(row: {
        date: Date;
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
    }): MacroData;
    /** When there is no row or it is not “today”, API still returns zeroed macros. */
    static empty(): MacroData;
    toJSON(): {
        date?: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fats: number;
    };
}
//# sourceMappingURL=macroData.d.ts.map