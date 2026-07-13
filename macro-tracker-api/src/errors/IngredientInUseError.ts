export class IngredientInUseError extends Error {
  readonly recipeNames: string[];

  constructor(recipeNames: string[]) {
    const list = recipeNames.join(", ");
    super(
      `Cannot delete this ingredient while it is used in recipe(s): ${list}. Remove those recipes first.`,
    );
    this.name = "IngredientInUseError";
    this.recipeNames = recipeNames;
  }
}
