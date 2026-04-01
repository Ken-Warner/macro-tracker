/** Ingredient row from `ingredients`; mirrors DB and list/create API payloads. */
export class Ingredient {
    id;
    userId;
    name;
    description;
    calories;
    protein;
    carbohydrates;
    fats;
    isDeleted;
    constructor(id, userId, name, description, calories, protein, carbohydrates, fats, isDeleted) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.calories = calories;
        this.protein = protein;
        this.carbohydrates = carbohydrates;
        this.fats = fats;
        this.isDeleted = isDeleted;
    }
    static fromDbRow(row) {
        return new Ingredient(row.id, row.user_id, row.name, row.description, row.calories, row.protein, row.carbohydrates, row.fats, row.is_deleted);
    }
    toJSON() {
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
//# sourceMappingURL=ingredient.js.map