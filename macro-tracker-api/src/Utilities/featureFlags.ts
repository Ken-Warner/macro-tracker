export function isIngredientOcrEnabled(): boolean {
  return process.env.INGREDIENT_OCR_ENABLED === "true";
}

export function isAwsSesEnabled(): boolean {
  return process.env.AWS_SES_ENABLED === "true";
}
