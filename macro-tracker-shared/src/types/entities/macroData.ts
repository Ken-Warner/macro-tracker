/** One day of macro totals from `macro_totals`. */
export class MacroData {
  constructor(
    public readonly date: string | undefined,
    public readonly calories: number,
    public readonly protein: number,
    public readonly carbohydrates: number,
    public readonly fats: number,
  ) {}

  static fromDbRow(row: {
    date: Date;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
  }): MacroData {
    return new MacroData(
      row.date.toISOString().split("T")[0],
      row.calories,
      row.protein,
      row.carbohydrates,
      row.fats,
    );
  }

  /** When there is no row or it is not “today”, API still returns zeroed macros. */
  static empty(): MacroData {
    return new MacroData(undefined, 0, 0, 0, 0);
  }

  toJSON(): {
    date?: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
  } {
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
