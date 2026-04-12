/** Ingredient row from `ingredients`; mirrors DB and list/create API payloads. */
export class Ingredient {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly calories: number | null,
    public readonly protein: number | null,
    public readonly carbohydrates: number | null,
    public readonly fats: number | null,
    public readonly isDeleted: boolean,
  ) {}

  static fromDbRow(row: {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    calories: number | null;
    protein: number | null;
    carbohydrates: number | null;
    fats: number | null;
    is_deleted: boolean;
  }): Ingredient {
    return new Ingredient(
      row.id,
      row.user_id,
      row.name,
      row.description,
      row.calories,
      row.protein,
      row.carbohydrates,
      row.fats,
      row.is_deleted,
    );
  }

  toJSON(): {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    calories: number | null;
    protein: number | null;
    carbohydrates: number | null;
    fats: number | null;
    is_deleted: boolean;
  } {
    return {
      id: this.id,
      user_id: this.userId,
      name: this.name,
      description: this.description,
      calories: this.calories,
      protein: this.protein,
      carbohydrates: this.carbohydrates,
      fats: this.fats,
      is_deleted: this.isDeleted,
    };
  }
}
