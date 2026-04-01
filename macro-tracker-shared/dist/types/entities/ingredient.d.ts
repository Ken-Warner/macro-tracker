/** Ingredient row from `ingredients`; mirrors DB and list/create API payloads. */
export declare class Ingredient {
    readonly id: number;
    readonly userId: number;
    readonly name: string;
    readonly description: string | null;
    readonly calories: number | null;
    readonly protein: number | null;
    readonly carbohydrates: number | null;
    readonly fats: number | null;
    readonly isDeleted: boolean;
    constructor(id: number, userId: number, name: string, description: string | null, calories: number | null, protein: number | null, carbohydrates: number | null, fats: number | null, isDeleted: boolean);
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
    }): Ingredient;
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
    };
}
//# sourceMappingURL=ingredient.d.ts.map