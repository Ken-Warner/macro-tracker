/** Meal row from `meals` after server-side date/time normalization. */
export class Meal {
    id;
    userId;
    name;
    description;
    date;
    time;
    calories;
    protein;
    carbohydrates;
    fats;
    isRecurring;
    constructor(id, userId, name, description, date, time, calories, protein, carbohydrates, fats, isRecurring) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.date = date;
        this.time = time;
        this.calories = calories;
        this.protein = protein;
        this.carbohydrates = carbohydrates;
        this.fats = fats;
        this.isRecurring = isRecurring;
    }
    static fromDbRow(row) {
        const dateStr = row.date instanceof Date
            ? (row.date.toISOString().split("T")[0] ?? "")
            : String(row.date);
        const timeStr = (typeof row.time === "string" ? row.time.split(".")[0] : String(row.time)) ??
            "";
        return new Meal(row.id, row.user_id, row.name, row.description, dateStr, timeStr, row.calories, row.protein, row.carbohydrates, row.fats, row.is_recurring ?? false);
    }
    /**
     * Partial row (e.g. recurring template query omits id / is_recurring).
     * Date may still be a `Date` from pg.
     */
    static fromPartialRow(row) {
        const dateVal = row.date instanceof Date ? row.date : new Date(row.date + "T00:00:00");
        return Meal.fromDbRow({
            ...row,
            date: dateVal,
        });
    }
    toJSON() {
        const base = {
            name: this.name,
            description: this.description,
            date: this.date,
            time: this.time,
            calories: this.calories,
            protein: this.protein,
            carbohydrates: this.carbohydrates,
            fats: this.fats,
            is_recurring: this.isRecurring,
        };
        return {
            ...base,
            ...(this.id !== undefined ? { id: this.id } : {}),
            ...(this.userId !== undefined ? { user_id: this.userId } : {}),
        };
    }
}
//# sourceMappingURL=meal.js.map