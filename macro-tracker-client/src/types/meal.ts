export interface Meal {
  id: number;
  name: string;
  description: string;
  date: string;
  time: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  isRecurring: boolean;
}

export const EMPTY_MEAL: Meal = {
  id: 0,
  name: "",
  description: "",
  date: "",
  time: "",
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fats: 0,
  isRecurring: false,
};
