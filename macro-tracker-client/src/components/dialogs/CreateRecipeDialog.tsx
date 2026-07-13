import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Loader from "../Loader";
import { createRecipe, getIngredients } from "../../utilities/api";
import { formatMacro } from "../../utilities/formatMacro";
import type {
  IngredientRow,
  RecipeDivisionMode,
  RecipeRow,
} from "@macro-tracker/macro-tracker-shared";

const PORTION_STEP = 0.25;
const MIN_PORTION = 0.25;

type CreateRecipeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (recipe: RecipeRow) => void;
  onCreateError: (message: string) => void;
};

function snapPortion(n: number): number {
  if (!Number.isFinite(n)) return MIN_PORTION;
  const snapped = Math.round(n / PORTION_STEP) * PORTION_STEP;
  return Math.max(MIN_PORTION, snapped);
}

export default function CreateRecipeDialog({
  isOpen,
  onClose,
  onCreated,
  onCreateError,
}: CreateRecipeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [divisionMode, setDivisionMode] =
    useState<RecipeDivisionMode>("portions");
  const [portionCount, setPortionCount] = useState(1);
  const [totalYieldOz, setTotalYieldOz] = useState(1);
  const [pantryIngredients, setPantryIngredients] = useState<IngredientRow[]>(
    [],
  );
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const [pantrySearch, setPantrySearch] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState(
    () => new Map<number, { defaultAmount: number }>(),
  );

  useEffect(() => {
    const modal = dialogRef.current;
    if (!modal) return;
    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function load() {
      setIngredientsLoading(true);
      setIngredientsError(null);
      const result = await getIngredients();
      if (cancelled) return;
      if (result.ok) {
        setPantryIngredients(
          result.body.filter((row) => !row.is_deleted),
        );
      } else {
        setIngredientsError(result.errorMessage);
        setPantryIngredients([]);
      }
      setIngredientsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const addOrMergeIngredient = useCallback((row: IngredientRow) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      const existing = next.get(row.id);
      const defaultAmount = existing
        ? existing.defaultAmount + 1
        : 1;
      next.set(row.id, { defaultAmount: snapPortion(defaultAmount) });
      return next;
    });
  }, []);

  const adjustAmount = useCallback((id: number, delta: number) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      const cur = next.get(id);
      if (!cur) return prev;
      next.set(id, {
        defaultAmount: snapPortion(cur.defaultAmount + delta),
      });
      return next;
    });
  }, []);

  const setAmountFromInput = useCallback((id: number, rawValue: string) => {
    const n = Number(rawValue);
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      next.set(id, { defaultAmount: snapPortion(n) });
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName === "") {
      onCreateError("You must provide a recipe name.");
      return;
    }
    if (selectedIngredients.size < 1) {
      onCreateError("You must provide at least one ingredient.");
      return;
    }
    if (divisionMode === "portions" && portionCount <= 0) {
      onCreateError("Portion count must be greater than 0.");
      return;
    }
    if (divisionMode === "per_ounce" && totalYieldOz <= 0) {
      onCreateError("Total yield must be greater than 0.");
      return;
    }

    setIsLoading(true);
    const result = await createRecipe({
      name: trimmedName,
      description: description.trim() || undefined,
      divisionMode,
      ...(divisionMode === "portions" ? { portionCount } : { totalYieldOz }),
      ingredients: [...selectedIngredients.entries()].map(
        ([ingredientId, { defaultAmount }]) => ({
          ingredientId,
          defaultAmount: snapPortion(defaultAmount),
        }),
      ),
    });
    setIsLoading(false);

    if (result.ok) {
      onCreated(result.body);
    } else {
      onCreateError(result.errorMessage);
    }
  }

  const q = pantrySearch.trim().toLowerCase();
  const filteredPantry =
    q === ""
      ? pantryIngredients
      : pantryIngredients.filter((row) =>
          row.name.toLowerCase().includes(q),
        );

  function ingredientNameForId(id: number) {
    const row = pantryIngredients.find((r) => r.id === id);
    return row ? row.name : `Ingredient #${id}`;
  }

  return (
    <dialog className="container-item" onClose={onClose} ref={dialogRef}>
      <div className="container-item-header">New Recipe</div>
      {isLoading ? (
        <>
          <br />
          <Loader size={1.5} thickness={3} />
        </>
      ) : (
        <div className="container-item-body">
          <form className="form" onSubmit={(e) => void handleSubmit(e)}>
            <label htmlFor="recipe-name">Name</label>
            <input
              id="recipe-name"
              className="input"
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              required
            />

            <label htmlFor="recipe-description">Description</label>
            <textarea
              id="recipe-description"
              className="textarea"
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
            />

            <fieldset className="recipe-division-fieldset">
              <legend>Divide recipe by</legend>
              <label className="recipe-radio-label">
                <input
                  type="radio"
                  name="divisionMode"
                  checked={divisionMode === "portions"}
                  onChange={() => setDivisionMode("portions")}
                />
                Number of portions
              </label>
              <label className="recipe-radio-label">
                <input
                  type="radio"
                  name="divisionMode"
                  checked={divisionMode === "per_ounce"}
                  onChange={() => setDivisionMode("per_ounce")}
                />
                Macros per ounce
              </label>
            </fieldset>

            {divisionMode === "portions" ? (
              <div className="create-meal-portion-row">
                <label
                  htmlFor="recipe-portion-count"
                  className="portion-name recipe-divisor-label"
                >
                  Number of portions
                </label>
                <div className="create-meal-portion-controls">
                  <button
                    type="button"
                    className="button"
                    aria-label="Decrease portions"
                    onClick={() =>
                      setPortionCount((prev) =>
                        snapPortion(prev - PORTION_STEP),
                      )
                    }
                  >
                    −
                  </button>
                  <input
                    id="recipe-portion-count"
                    type="number"
                    className="input create-meal-portion-input"
                    min={MIN_PORTION}
                    step={PORTION_STEP}
                    value={portionCount}
                    onChange={(e) =>
                      setPortionCount(snapPortion(Number(e.target.value)))
                    }
                    onFocus={(e) => e.target.select()}
                    aria-label="Number of portions"
                  />
                  <button
                    type="button"
                    className="button"
                    aria-label="Increase portions"
                    onClick={() =>
                      setPortionCount((prev) =>
                        snapPortion(prev + PORTION_STEP),
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="create-meal-portion-row">
                <label
                  htmlFor="recipe-total-yield"
                  className="portion-name recipe-divisor-label"
                >
                  Total yield (oz)
                </label>
                <div className="create-meal-portion-controls">
                  <button
                    type="button"
                    className="button"
                    aria-label="Decrease total yield"
                    onClick={() =>
                      setTotalYieldOz((prev) =>
                        snapPortion(prev - PORTION_STEP),
                      )
                    }
                  >
                    −
                  </button>
                  <input
                    id="recipe-total-yield"
                    type="number"
                    className="input create-meal-portion-input"
                    min={MIN_PORTION}
                    step={PORTION_STEP}
                    value={totalYieldOz}
                    onChange={(e) =>
                      setTotalYieldOz(snapPortion(Number(e.target.value)))
                    }
                    onFocus={(e) => e.target.select()}
                    aria-label="Total yield in ounces"
                  />
                  <button
                    type="button"
                    className="button"
                    aria-label="Increase total yield"
                    onClick={() =>
                      setTotalYieldOz((prev) =>
                        snapPortion(prev + PORTION_STEP),
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <label htmlFor="recipe-pantry-search">Search ingredients</label>
            <input
              id="recipe-pantry-search"
              className="input"
              type="search"
              value={pantrySearch}
              onChange={(e) => setPantrySearch(e.target.value)}
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

            {selectedIngredients.size > 0 ? (
              <div className="create-meal-selected-heading">
                Ingredients in recipe
              </div>
            ) : null}

            {[...selectedIngredients.entries()].map(([id, data]) => (
              <div key={id} className="create-meal-portion-row">
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
                    aria-label="Decrease amount"
                    onClick={() => adjustAmount(id, -PORTION_STEP)}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="input create-meal-portion-input"
                    min={MIN_PORTION}
                    step={PORTION_STEP}
                    value={data.defaultAmount}
                    onChange={(event) =>
                      setAmountFromInput(id, event.target.value)
                    }
                    onFocus={(event) => event.target.select()}
                    aria-label={`Default amount for ${ingredientNameForId(id)}`}
                  />
                  <button
                    type="button"
                    className="button"
                    aria-label="Increase amount"
                    onClick={() => adjustAmount(id, PORTION_STEP)}
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

            <div className="modal-button-container">
              <button className="button" type="submit">
                Create
              </button>
              <button className="button" type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </dialog>
  );
}
