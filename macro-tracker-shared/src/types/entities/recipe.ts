import { InvalidPropertyException } from "../exceptions/index.js";

export type RecipeDivisionMode = "portions" | "per_ounce";

export type RecipeIngredientLine = {
  ingredient_id: number;
  name: string;
  default_amount: number;
  current_amount: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

export type RecipeMacros = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

export class Recipe {
  private _id: number;
  private _userId: number;
  public name: string;
  private _description: string;
  private _divisionMode: RecipeDivisionMode;
  private _portionCount: number | null;
  private _totalYieldOz: number | null;
  private _ingredients: RecipeIngredientLine[];

  public get id(): number {
    return this._id;
  }

  public set id(value: number) {
    if (value < 0) {
      throw new InvalidPropertyException("id cannot be negative");
    }
    this._id = value;
  }

  public get userId(): number {
    return this._userId;
  }

  public set userId(value: number) {
    if (value === undefined || value < 0) {
      throw new InvalidPropertyException(
        "userId cannot be undefined or negative",
      );
    }
    this._userId = value;
  }

  public get description(): string {
    return this._description;
  }

  public set description(value: string) {
    if (value === undefined) {
      throw new InvalidPropertyException("description cannot be undefined");
    }
    this._description = value;
  }

  public get divisionMode(): RecipeDivisionMode {
    return this._divisionMode;
  }

  public set divisionMode(value: RecipeDivisionMode) {
    if (value !== "portions" && value !== "per_ounce") {
      throw new InvalidPropertyException(
        "divisionMode must be 'portions' or 'per_ounce'",
      );
    }
    this._divisionMode = value;
  }

  public get portionCount(): number | null {
    return this._portionCount;
  }

  public set portionCount(value: number | null) {
    if (value != null && value <= 0) {
      throw new InvalidPropertyException("portionCount must be greater than 0");
    }
    this._portionCount = value;
  }

  public get totalYieldOz(): number | null {
    return this._totalYieldOz;
  }

  public set totalYieldOz(value: number | null) {
    if (value != null && value <= 0) {
      throw new InvalidPropertyException(
        "totalYieldOz must be greater than 0",
      );
    }
    this._totalYieldOz = value;
  }

  public get ingredients(): RecipeIngredientLine[] {
    return this._ingredients;
  }

  public set ingredients(value: RecipeIngredientLine[]) {
    this._ingredients = value;
  }

  constructor(
    name: string,
    divisionMode: RecipeDivisionMode,
    options?: {
      portionCount?: number | null;
      totalYieldOz?: number | null;
      description?: string;
      ingredients?: RecipeIngredientLine[];
    },
  ) {
    this.name = name;
    this._divisionMode = divisionMode;
    this._portionCount = options?.portionCount ?? null;
    this._totalYieldOz = options?.totalYieldOz ?? null;
    this._description = options?.description ?? "";
    this._ingredients = options?.ingredients ?? [];
    this._id = 0;
    this._userId = 0;
  }

  get divisor(): number {
    if (this._divisionMode === "portions") {
      return this._portionCount ?? 0;
    }
    return this._totalYieldOz ?? 0;
  }

  get macrosTotal(): RecipeMacros {
    return this._ingredients.reduce(
      (acc, line) => ({
        calories: acc.calories + line.calories * line.current_amount,
        protein: acc.protein + line.protein * line.current_amount,
        carbohydrates:
          acc.carbohydrates + line.carbohydrates * line.current_amount,
        fats: acc.fats + line.fats * line.current_amount,
      }),
      { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
    );
  }

  get macrosPerUnit(): RecipeMacros {
    const total = this.macrosTotal;
    const divisor = this.divisor;
    if (divisor <= 0) {
      return { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };
    }
    return {
      calories: total.calories / divisor,
      protein: total.protein / divisor,
      carbohydrates: total.carbohydrates / divisor,
      fats: total.fats / divisor,
    };
  }

  static fromDbRow(row: {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    division_mode: RecipeDivisionMode;
    portion_count: number | null;
    total_yield_oz: number | null;
    ingredients?: RecipeIngredientLine[];
  }): Recipe {
    const recipe = new Recipe(row.name, row.division_mode, {
      portionCount: row.portion_count,
      totalYieldOz: row.total_yield_oz,
      description: row.description ?? "",
      ingredients: row.ingredients ?? [],
    });
    recipe.id = row.id;
    recipe.userId = row.user_id;
    return recipe;
  }

  toJSON(): {
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    division_mode: RecipeDivisionMode;
    portion_count: number | null;
    total_yield_oz: number | null;
    ingredients: RecipeIngredientLine[];
    macros_total: RecipeMacros;
    macros_per_unit: RecipeMacros;
  } {
    return {
      id: this._id,
      user_id: this._userId,
      name: this.name,
      description: this._description,
      division_mode: this._divisionMode,
      portion_count: this._portionCount,
      total_yield_oz: this._totalYieldOz,
      ingredients: this._ingredients,
      macros_total: this.macrosTotal,
      macros_per_unit: this.macrosPerUnit,
    };
  }
}
