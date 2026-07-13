import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type {
  IngredientRow,
  RecipeRow,
} from "@macro-tracker/macro-tracker-shared";
import type { Meal } from "../../types/meal";
import Loader from "../Loader";
import ToastMessage, { type Toast } from "../reusables/ToastMessage";
import {
  getIngredients,
  getRecipes,
  postMealComposed,
  postMealNonComposed,
} from "../../utilities/api";
import { formatMacro } from "../../utilities/formatMacro";

const PORTION_STEP = 0.25;
const MIN_PORTION = 0.25;

type CreateMealDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddNewMeal: (meal: Meal) => void;
  mealToCopy: Meal;
};

type MealCreationTab = "manual" | "composed";

function snapPortion(n: number): number {
  if (!Number.isFinite(n)) return MIN_PORTION;
  const snapped = Math.round(n / PORTION_STEP) * PORTION_STEP;
  return Math.max(MIN_PORTION, snapped);
}

function toMealFromApiResponse(data: Record<string, unknown>): Meal {
  return {
    id: Number(data.id),
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    time: String(data.time ?? ""),
    calories: Number(data.calories ?? 0),
    protein: Number(data.protein ?? 0),
    carbohydrates: Number(data.carbohydrates ?? 0),
    fats: Number(data.fats ?? 0),
    isRecurring: Boolean(data.isRecurring ?? data.is_recurring),
  };
}

export default function CreateMealDialog({
  isOpen,
  onClose,
  onAddNewMeal,
  mealToCopy,
}: CreateMealDialogProps) {
  const createMealModal = useRef<HTMLDialogElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Meal>(mealToCopy);
  const [activeTab, setActiveTab] = useState<MealCreationTab>("manual");

  const [pantryIngredients, setPantryIngredients] = useState<IngredientRow[]>(
    [],
  );
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const [pantrySearch, setPantrySearch] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState(
    () => new Map<number, { portionSize: number }>(),
  );

  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState<string | null>(null);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [selectedRecipes, setSelectedRecipes] = useState(
    () => new Map<number, { amount: number }>(),
  );

  const [toast, setToast] = useState<Toast | null>(null);
  const isToastDisplayed = toast != null;

  useEffect(() => {
    const modal = createMealModal.current;
    if (!modal) return;

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T");

    const copiedMealData: Meal = {
      ...mealToCopy,
      date: today[0],
      time: today[1].split(".")[0].slice(0, -3),
      id: 0,
    };

    setFormData(copiedMealData);
  }, [mealToCopy]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("manual");
    setSelectedIngredients(new Map());
    setSelectedRecipes(new Map());
    setPantrySearch("");
    setRecipeSearch("");
  }, [isOpen, mealToCopy]);

  useEffect(() => {
    if (!isOpen || activeTab !== "composed") return;

    let cancelled = false;

    async function load() {
      setIngredientsLoading(true);
      setRecipesLoading(true);
      setIngredientsError(null);
      setRecipesError(null);

      const [ingredientsResult, recipesResult] = await Promise.all([
        getIngredients(),
        getRecipes(),
      ]);
      if (cancelled) return;

      if (ingredientsResult.ok) {
        setPantryIngredients(
          ingredientsResult.body.filter((row) => !row.is_deleted),
        );
      } else {
        setIngredientsError(ingredientsResult.errorMessage);
        setPantryIngredients([]);
      }

      if (recipesResult.ok) {
        setRecipes(recipesResult.body);
      } else {
        setRecipesError(recipesResult.errorMessage);
        setRecipes([]);
      }

      setIngredientsLoading(false);
      setRecipesLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTab]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setFormData((prevValues) => ({
      ...prevValues,
      [name]:
        name === "calories" ||
        name === "protein" ||
        name === "carbohydrates" ||
        name === "fats"
          ? Number(value)
          : value,
    }));
  }

  const addOrMergeIngredient = useCallback((row: IngredientRow) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      const existing = next.get(row.id);
      const portionSize = existing ? existing.portionSize + 1 : 1;
      next.set(row.id, { portionSize: snapPortion(portionSize) });
      return next;
    });
  }, []);

  const adjustPortion = useCallback((id: number, delta: number) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      const cur = next.get(id);
      if (!cur) return prev;
      next.set(id, {
        portionSize: snapPortion(cur.portionSize + delta),
      });
      return next;
    });
  }, []);

  const setPortionFromInput = useCallback((id: number, rawValue: string) => {
    const n = parseFloat(rawValue);
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      next.set(id, { portionSize: snapPortion(n) });
      return next;
    });
  }, []);

  const removeIngredient = useCallback((id: number) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const addOrMergeRecipe = useCallback((row: RecipeRow) => {
    setSelectedRecipes((prev) => {
      const next = new Map(prev);
      const existing = next.get(row.id);
      const amount = existing ? existing.amount + 1 : 1;
      next.set(row.id, { amount: snapPortion(amount) });
      return next;
    });
  }, []);

  const adjustRecipeAmount = useCallback((id: number, delta: number) => {
    setSelectedRecipes((prev) => {
      const next = new Map(prev);
      const cur = next.get(id);
      if (!cur) return prev;
      next.set(id, {
        amount: snapPortion(cur.amount + delta),
      });
      return next;
    });
  }, []);

  const setRecipeAmountFromInput = useCallback(
    (id: number, rawValue: string) => {
      const n = parseFloat(rawValue);
      setSelectedRecipes((prev) => {
        const next = new Map(prev);
        next.set(id, { amount: snapPortion(n) });
        return next;
      });
    },
    [],
  );

  const removeRecipe = useCallback((id: number) => {
    setSelectedRecipes((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoading(true);
    try {
      if (activeTab === "manual") {
        const newMeal = await postMealNonComposed(formData);
        onAddNewMeal(toMealFromApiResponse(newMeal as Record<string, unknown>));
        onClose();
      } else {
        const ingredientsPayload = [...selectedIngredients.entries()].map(
          ([ingredientId, { portionSize }]) => ({
            ingredientId,
            portionSize: snapPortion(portionSize),
          }),
        );
        const recipesPayload = [...selectedRecipes.entries()].map(
          ([recipeId, { amount }]) => ({
            recipeId,
            amount: snapPortion(amount),
          }),
        );

        if (ingredientsPayload.length < 1 && recipesPayload.length < 1) {
          setToast({
            type: "error",
            message: "You must provide at least one ingredient or recipe.",
          });
          return;
        }

        const nameTrimmed = String(formData.name ?? "").trim();
        if (!nameTrimmed) {
          setToast({ type: "error", message: "You must provide a meal name." });
          return;
        }

        const payload = {
          name: nameTrimmed,
          ingredients: ingredientsPayload,
          recipes: recipesPayload,
          ...(formData.description
            ? { description: formData.description }
            : {}),
          ...(formData.date ? { date: formData.date } : {}),
          ...(formData.time ? { time: formData.time } : {}),
        };

        const newMeal = await postMealComposed(payload);
        onAddNewMeal(toMealFromApiResponse(newMeal as Record<string, unknown>));
        onClose();
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const q = pantrySearch.trim().toLowerCase();
  const filteredPantry =
    q === ""
      ? pantryIngredients
      : pantryIngredients.filter((row) =>
          row.name.toLowerCase().includes(q),
        );

  const recipeQ = recipeSearch.trim().toLowerCase();
  const filteredRecipes =
    recipeQ === ""
      ? recipes
      : recipes.filter((row) => row.name.toLowerCase().includes(recipeQ));

  function ingredientNameForId(id: number) {
    const row = pantryIngredients.find((r) => r.id === id);
    return row ? row.name : `Ingredient #${id}`;
  }

  function recipeNameForId(id: number) {
    const row = recipes.find((r) => r.id === id);
    return row ? row.name : `Recipe #${id}`;
  }

  function recipeAmountLabel(id: number) {
    const row = recipes.find((r) => r.id === id);
    return row?.division_mode === "per_ounce" ? "Ounces" : "Portions";
  }

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      <dialog
        className="container-item"
        onClose={onClose}
        ref={createMealModal}
      >
        <div className="container-item-header">Add Meal</div>
        {isLoading ? (
          <>
            <br />
            <Loader size={1.5} thickness={3} />
          </>
        ) : (
          <div className="container-item-body">
            <form className="form" onSubmit={handleSubmit}>
              <div
                className="create-meal-tab-row"
                role="tablist"
                aria-label="Meal creation mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "manual"}
                  className={
                    "button" +
                    (activeTab === "manual" ? " button-tab-active" : "")
                  }
                  onClick={() => setActiveTab("manual")}
                >
                  Manual macros
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "composed"}
                  className={
                    "button" +
                    (activeTab === "composed" ? " button-tab-active" : "")
                  }
                  onClick={() => setActiveTab("composed")}
                >
                  From pantry
                </button>
              </div>

              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
              <label htmlFor="date">Date</label>
              <input
                type="date"
                name="date"
                id="date"
                className="input"
                value={formData.date}
                onChange={handleChange}
              />
              <label htmlFor="time">Time</label>
              <input
                type="time"
                name="time"
                id="time"
                className="input"
                step={60}
                value={formData.time}
                onChange={handleChange}
              />

              {activeTab === "manual" ? (
                <>
                  <label htmlFor="calories">Calories</label>
                  <input
                    type="number"
                    name="calories"
                    id="calories"
                    className="input"
                    value={formData.calories}
                    onChange={handleChange}
                    onFocus={(event) => event.target.select()}
                  />
                  <label htmlFor="protein">Protein</label>
                  <input
                    type="number"
                    name="protein"
                    id="protein"
                    className="input"
                    value={formData.protein}
                    onChange={handleChange}
                    onFocus={(event) => event.target.select()}
                  />
                  <label htmlFor="carbohydrates">Carbohydrates</label>
                  <input
                    type="number"
                    name="carbohydrates"
                    id="carbohydrates"
                    className="input"
                    value={formData.carbohydrates}
                    onChange={handleChange}
                    onFocus={(event) => event.target.select()}
                  />
                  <label htmlFor="fats">Fats</label>
                  <input
                    type="number"
                    name="fats"
                    id="fats"
                    className="input"
                    value={formData.fats}
                    onChange={handleChange}
                    onFocus={(event) => event.target.select()}
                  />
                </>
              ) : null}

              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                className="textarea"
                value={formData.description}
                onChange={handleChange}
              />

              {activeTab === "composed" ? (
                <>
                  <div className="create-meal-section-heading">Ingredients</div>
                  <label htmlFor="pantry-search-create-meal">
                    Search ingredients
                  </label>
                  <input
                    id="pantry-search-create-meal"
                    className="input"
                    type="search"
                    value={pantrySearch}
                    onChange={(event) => setPantrySearch(event.target.value)}
                    autoComplete="off"
                  />

                  {ingredientsLoading ? (
                    <Loader size={1.25} thickness={3} />
                  ) : ingredientsError ? (
                    <p>{ingredientsError}</p>
                  ) : pantryIngredients.length === 0 ? (
                    <p>Your pantry is empty.</p>
                  ) : filteredPantry.length === 0 ? (
                    <p>No ingredients match your search.</p>
                  ) : (
                    <div
                      className="create-meal-ingredient-scroll"
                      role="listbox"
                      aria-label="Ingredients to add"
                    >
                      {filteredPantry.map((row) => (
                        <div
                          key={row.id}
                          role="option"
                          className="accordion-item"
                          onClick={() => addOrMergeIngredient(row)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              addOrMergeIngredient(row);
                            }
                          }}
                          tabIndex={0}
                        >
                          <div className="accordion-item-title">{row.name}</div>
                          <div className="accordion-item-macro-grid">
                            <div className="calories color-calories">
                              {formatMacro(row.calories)}
                            </div>
                            <div className="protein color-protein">
                              {formatMacro(row.protein)}
                            </div>
                            <div className="carbohydrates color-carbohydrates">
                              {formatMacro(row.carbohydrates)}
                            </div>
                            <div className="fats color-fats">
                              {formatMacro(row.fats)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="create-meal-section-heading">Recipes</div>
                  <label htmlFor="recipe-search-create-meal">
                    Search recipes
                  </label>
                  <input
                    id="recipe-search-create-meal"
                    className="input"
                    type="search"
                    value={recipeSearch}
                    onChange={(event) => setRecipeSearch(event.target.value)}
                    autoComplete="off"
                  />

                  {recipesLoading ? (
                    <Loader size={1.25} thickness={3} />
                  ) : recipesError ? (
                    <p>{recipesError}</p>
                  ) : recipes.length === 0 ? (
                    <p>You have no recipes yet.</p>
                  ) : filteredRecipes.length === 0 ? (
                    <p>No recipes match your search.</p>
                  ) : (
                    <div
                      className="create-meal-ingredient-scroll"
                      role="listbox"
                      aria-label="Recipes to add"
                    >
                      {filteredRecipes.map((row) => (
                        <div
                          key={row.id}
                          role="option"
                          className="accordion-item"
                          onClick={() => addOrMergeRecipe(row)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              addOrMergeRecipe(row);
                            }
                          }}
                          tabIndex={0}
                        >
                          <div className="accordion-item-title">
                            {row.name}
                            <span className="recipe-unit-label">
                              {" "}
                              (
                              {row.division_mode === "portions"
                                ? "per portion"
                                : "per oz"}
                              )
                            </span>
                          </div>
                          <div className="accordion-item-macro-grid">
                            <div className="calories color-calories">
                              {formatMacro(row.macros_per_unit.calories)}
                            </div>
                            <div className="protein color-protein">
                              {formatMacro(row.macros_per_unit.protein)}
                            </div>
                            <div className="carbohydrates color-carbohydrates">
                              {formatMacro(row.macros_per_unit.carbohydrates)}
                            </div>
                            <div className="fats color-fats">
                              {formatMacro(row.macros_per_unit.fats)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedIngredients.size > 0 || selectedRecipes.size > 0 ? (
                    <div className="create-meal-selected-heading">
                      In this meal
                    </div>
                  ) : null}

                  {[...selectedIngredients.entries()].map(([id, data]) => (
                    <div key={`ing-${id}`} className="create-meal-portion-row">
                      <span
                        className="portion-name"
                        title={ingredientNameForId(id)}
                      >
                        {ingredientNameForId(id)}
                      </span>
                      <div className="create-meal-portion-controls">
                        <button
                          type="button"
                          className="button"
                          aria-label="Decrease portion"
                          onClick={() => adjustPortion(id, -PORTION_STEP)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="input create-meal-portion-input"
                          min={MIN_PORTION}
                          step={PORTION_STEP}
                          value={data.portionSize}
                          onChange={(event) =>
                            setPortionFromInput(id, event.target.value)
                          }
                          onFocus={(event) => event.target.select()}
                          aria-label={`Portions for ${ingredientNameForId(id)}`}
                        />
                        <button
                          type="button"
                          className="button"
                          aria-label="Increase portion"
                          onClick={() => adjustPortion(id, PORTION_STEP)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="button"
                          aria-label={`Remove ${ingredientNameForId(id)}`}
                          onClick={() => removeIngredient(id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  {[...selectedRecipes.entries()].map(([id, data]) => (
                    <div key={`rec-${id}`} className="create-meal-portion-row">
                      <span
                        className="portion-name"
                        title={recipeNameForId(id)}
                      >
                        {recipeNameForId(id)}{" "}
                        <span className="recipe-unit-label">
                          ({recipeAmountLabel(id)})
                        </span>
                      </span>
                      <div className="create-meal-portion-controls">
                        <button
                          type="button"
                          className="button"
                          aria-label={`Decrease ${recipeAmountLabel(id).toLowerCase()}`}
                          onClick={() => adjustRecipeAmount(id, -PORTION_STEP)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="input create-meal-portion-input"
                          min={MIN_PORTION}
                          step={PORTION_STEP}
                          value={data.amount}
                          onChange={(event) =>
                            setRecipeAmountFromInput(id, event.target.value)
                          }
                          onFocus={(event) => event.target.select()}
                          aria-label={`${recipeAmountLabel(id)} for ${recipeNameForId(id)}`}
                        />
                        <button
                          type="button"
                          className="button"
                          aria-label={`Increase ${recipeAmountLabel(id).toLowerCase()}`}
                          onClick={() => adjustRecipeAmount(id, PORTION_STEP)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="button"
                          aria-label={`Remove ${recipeNameForId(id)}`}
                          onClick={() => removeRecipe(id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : null}

              <div className="modal-button-container">
                <button className="button" type="submit">
                  Submit
                </button>
                <button className="button" type="button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </dialog>
    </>
  );
}
