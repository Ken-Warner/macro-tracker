/** One day of macro totals from `macro_totals`. */
export class MacroData {
    date;
    calories;
    protein;
    carbohydrates;
    fats;
    constructor(date, calories, protein, carbohydrates, fats) {
        this.date = date;
        this.calories = calories;
        this.protein = protein;
        this.carbohydrates = carbohydrates;
        this.fats = fats;
    }
    static fromDbRow(row) {
        return new MacroData(row.date.toISOString().split("T")[0], row.calories, row.protein, row.carbohydrates, row.fats);
    }
    /** When there is no row or it is not “today”, API still returns zeroed macros. */
    static empty() {
        return new MacroData(undefined, 0, 0, 0, 0);
    }
    toJSON() {
        const base = {
            calories: this.calories,
            protein: this.protein,
            carbohydrates: this.carbohydrates,
            fats: this.fats,
        };
        if (this.date !== undefined) {
            return { ...base, date: this.date };
        }
        return base;
    }
}
//# sourceMappingURL=macroData.js.map