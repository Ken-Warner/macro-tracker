import { Ingredient } from "@macro-tracker/macro-tracker-shared";
type RawIngredientInput = {
    name: string;
    description?: string | undefined;
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fats?: number;
};
type RecipeComponentInput = {
    ingredientId: number;
    portionSize: number;
};
export declare function createIngredientRaw(userId: string, ingredient: RawIngredientInput): Promise<Ingredient | undefined>;
export declare function createIngredientFromComponents(userId: string, name: string, description: string | undefined, components: RecipeComponentInput[]): Promise<Ingredient | undefined>;
export declare function deleteIngredientById(userId: string, ingredientId: number): Promise<number>;
export declare function getIngredientsByUserId(userId: string): Promise<Ingredient[]>;
export {};
//# sourceMappingURL=ingredients.model.d.ts.map