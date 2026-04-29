export class MacroData {
  public date: string | undefined;
  public calories: number;
  public protein: number;
  public carbohydrates: number;
  public fats: number;

  constructor(
    date: string | undefined = undefined,
    calories: number = 0,
    protein: number = 0,
    carbohydrates: number = 0,
    fats: number = 0,
  ) {
    this.date = date;
    this.calories = calories;
    this.protein = protein;
    this.carbohydrates = carbohydrates;
    this.fats = fats;
  }
}
