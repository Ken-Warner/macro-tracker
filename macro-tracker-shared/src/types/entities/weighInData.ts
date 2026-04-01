/** Weigh-in row from `user_weights` (targets optional for range-only rows). */
export class WeighInData {
  constructor(
    public readonly date: Date,
    public readonly weight: number,
    public readonly targetCalories: number | null = null,
    public readonly targetProtein: number | null = null,
    public readonly targetCarbohydrates: number | null = null,
    public readonly targetFats: number | null = null,
  ) {}

  static fromRangeRow(row: { date: Date; weight: number }): WeighInData {
    return new WeighInData(row.date, row.weight);
  }

  static fromRecentRow(row: {
    date: Date;
    weight: number;
    target_calories: number | null;
    target_protein: number | null;
    target_carbohydrates: number | null;
    target_fats: number | null;
  }): WeighInData {
    return new WeighInData(
      row.date,
      row.weight,
      row.target_calories,
      row.target_protein,
      row.target_carbohydrates,
      row.target_fats,
    );
  }

  /** Range list item: ISO date string + weight. */
  toRangeJSON(): { date: string; weight: number } {
    return {
      date: this.date.toISOString().split("T")[0] ?? "",
      weight: this.weight,
    };
  }

  /** Recent endpoint: camelCase targets. */
  toRecentJSON(): {
    date: string;
    weight: number;
    targetCalories: number | null;
    targetProtein: number | null;
    targetCarbohydrates: number | null;
    targetFats: number | null;
  } {
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
