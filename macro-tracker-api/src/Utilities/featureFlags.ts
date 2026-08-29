export function isIngredientOcrEnabled(): boolean {
  return process.env.INGREDIENT_OCR_ENABLED === "true";
}
