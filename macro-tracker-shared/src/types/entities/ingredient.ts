import { InvalidPropertyException } from "../exceptions/index.js";

export class Ingredient {
  private _id: number;
  private _userId: number;

  public name: string;
  private _description: string;
  private _calories: number;
  private _protein: number;
  private _carbohydrates: number;
  private _fats: number;
  public isDeleted: boolean;

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

  public get calories(): number {
    return this._calories;
  }

  public set calories(value: number) {
    if (value < 0) {
      throw new InvalidPropertyException("calories cannot be negative");
    }
    this._calories = value;
  }

  public get protein(): number {
    return this._protein;
  }

  public set protein(value: number) {
    if (value < 0) {
      throw new InvalidPropertyException("protein cannot be negative");
    }
    this._protein = value;
  }

  public get carbohydrates(): number {
    return this._carbohydrates;
  }

  public set carbohydrates(value: number) {
    if (value < 0) {
      throw new InvalidPropertyException("carbohydrates cannot be negative");
    }
    this._carbohydrates = value;
  }

  public get fats(): number {
    return this._fats;
  }

  public set fats(value: number) {
    if (value < 0) {
      throw new InvalidPropertyException("fats cannot be negative");
    }
    this._fats = value;
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

  constructor(
    name: string,
    calories?: number,
    protein?: number,
    carbohydrates?: number,
    fats?: number,
  ) {
    this.name = name;
    this._calories = calories ?? 0;
    this._protein = protein ?? 0;
    this._carbohydrates = carbohydrates ?? 0;
    this._fats = fats ?? 0;
    this._description = "";
    this.isDeleted = false;
    this._id = 0;
    this._userId = 0;
  }

  static fromDbRow(row: {
    id: number;
    user_id: number;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fats: number;
    is_deleted: boolean;
  }): Ingredient {
    let ingredient = new Ingredient(
      row.name,
      row.calories,
      row.protein,
      row.carbohydrates,
      row.fats,
    );
    ingredient.userId = row.user_id;
    ingredient.description = row.description;
    ingredient.isDeleted = row.is_deleted;
    return ingredient;
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
      id: this._id,
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
