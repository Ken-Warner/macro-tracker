/** Weigh-in row from `user_weights` (targets optional for range-only rows). */
export class WeighInData {
    date;
    weight;
    targetCalories;
    targetProtein;
    targetCarbohydrates;
    targetFats;
    constructor(date, weight, targetCalories = null, targetProtein = null, targetCarbohydrates = null, targetFats = null) {
        this.date = date;
        this.weight = weight;
        this.targetCalories = targetCalories;
        this.targetProtein = targetProtein;
        this.targetCarbohydrates = targetCarbohydrates;
        this.targetFats = targetFats;
    }
    static fromRangeRow(row) {
        return new WeighInData(row.date, row.weight);
    }
    static fromRecentRow(row) {
        return new WeighInData(row.date, row.weight, row.target_calories, row.target_protein, row.target_carbohydrates, row.target_fats);
    }
    static fromRecentJSON(json) {
        return new WeighInData(new Date(json.date), json.weight, json.targetCalories, json.targetProtein, json.targetCarbohydrates, json.targetFats);
    }
    /** Range list item: ISO date string + weight. */
    toRangeJSON() {
        return {
            date: this.date.toISOString().split("T")[0] ?? "",
            weight: this.weight,
        };
    }
    /** Recent endpoint: camelCase targets. */
    toRecentJSON() {
        return {
            date: this.date.toISOString().split("T")[0] ?? "",
            weight: this.weight,
            targetCalories: this.targetCalories,
            targetProtein: this.targetProtein,
            targetCarbohydrates: this.targetCarbohydrates,
            targetFats: this.targetFats,
        };
    }
}
//# sourceMappingURL=weighInData.js.map