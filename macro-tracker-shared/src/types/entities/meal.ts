/** Meal row from `meals` after server-side date/time normalization. */
export class Meal {
  constructor(
    public readonly id: number | undefined,
    public readonly userId: number | undefined,
    public readonly name: string,
    public readonly description: string | null,
    public readonly date: string,
    public readonly time: string,
    public readonly calories: number,
    public readonly protein: number,
    public readonly carbohydrates: number,
    public readonly fats: number,
    public readonly isRecurring: boolean,
  ) {}

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
  }): Meal {
    const dateStr =
      row.date instanceof Date
        ? (row.date.toISOString().split("T")[0] ?? "")
        : String(row.date);
    const timeStr =
      (typeof row.time === "string" ? row.time.split(".")[0] : String(row.time)) ??
      "";
    return new Meal(
      row.id,
      row.user_id,
      row.name,
      row.description,
      dateStr,
      timeStr,
      row.calories,
      row.protein,
      row.carbohydrates,
      row.fats,
      row.is_recurring ?? false,
    );
  }

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
  }): Meal {
    const dateVal = row.date instanceof Date ? row.date : new Date(row.date + "T00:00:00");
    return Meal.fromDbRow({
      ...row,
      date: dateVal,
    });
  }

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
  } {
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
