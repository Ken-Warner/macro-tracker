import { useEffect, useRef, useState } from "react";
import Loader from "../Loader";
import type { RecipeRow } from "@macro-tracker/macro-tracker-shared";
import {
  deleteRecipe,
  patchRecipe,
  resetRecipe,
} from "../../utilities/api";
import { formatMacro } from "../../utilities/formatMacro";

const PORTION_STEP = 0.25;
const MIN_PORTION = 0.25;

type RecipeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeRow | null;
  onUpdated?: (recipe: RecipeRow) => void;
  onDeleted?: (recipeId: number) => void;
};

function snapPortion(n: number): number {
  if (!Number.isFinite(n)) return MIN_PORTION;
  const snapped = Math.round(n / PORTION_STEP) * PORTION_STEP;
  return Math.max(MIN_PORTION, snapped);
}

function computeMacros(recipe: {
  ingredients: RecipeRow["ingredients"];
  division_mode: RecipeRow["division_mode"];
  portion_count: number | null;
  total_yield_oz: number | null;
}) {
  const total = recipe.ingredients.reduce(
    (acc, line) => ({
      calories: acc.calories + line.calories * line.current_amount,
      protein: acc.protein + line.protein * line.current_amount,
      carbohydrates:
        acc.carbohydrates + line.carbohydrates * line.current_amount,
      fats: acc.fats + line.fats * line.current_amount,
    }),
    { calories: 0, protein: 0, carbohydrates: 0, fats: 0 },
  );
  const divisor =
    recipe.division_mode === "portions"
      ? (recipe.portion_count ?? 0)
      : (recipe.total_yield_oz ?? 0);
  const perUnit =
    divisor > 0
      ? {
          calories: total.calories / divisor,
          protein: total.protein / divisor,
          carbohydrates: total.carbohydrates / divisor,
          fats: total.fats / divisor,
        }
      : { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };
  return { total, perUnit };
}

export default function RecipeDialog({
  isOpen,
  onClose,
  recipe,
  onUpdated,
  onDeleted,
}: RecipeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<RecipeRow | null>(() =>
    recipe ? structuredClone(recipe) : null,
  );
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const modal = dialogRef.current;
    if (!modal) return;
    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  async function handleSave(): Promise<void> {
    if (!draft) return;
    setIsBusy(true);
    setError(null);
    const result = await patchRecipe(draft.id, {
      ...(draft.division_mode === "per_ounce"
        ? { totalYieldOz: draft.total_yield_oz ?? undefined }
        : {}),
      ingredients: draft.ingredients.map((line) => ({
        ingredientId: line.ingredient_id,
        currentAmount: line.current_amount,
      })),
    });
    setIsBusy(false);
    if (result.ok) {
      setDraft(result.body);
      onUpdated?.(result.body);
    } else {
      setError(result.errorMessage);
    }
  }

  async function handleReset(): Promise<void> {
    if (!draft) return;
    setIsBusy(true);
    setError(null);
    const result = await resetRecipe(draft.id);
    setIsBusy(false);
    if (result.ok) {
      setDraft(result.body);
      onUpdated?.(result.body);
    } else {
      setError(result.errorMessage);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!draft) return;
    setIsBusy(true);
    setError(null);
    const result = await deleteRecipe(draft.id);
    setIsBusy(false);
    if (result.ok) {
      onDeleted?.(draft.id);
      onClose();
    } else {
      setError(result.errorMessage);
    }
  }

  function adjustAmount(ingredientId: number, delta: number): void {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map((line) =>
          line.ingredient_id === ingredientId
            ? {
                ...line,
                current_amount: snapPortion(line.current_amount + delta),
              }
            : line,
        ),
      };
    });
  }

  function setAmount(ingredientId: number, raw: string): void {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map((line) =>
          line.ingredient_id === ingredientId
            ? { ...line, current_amount: snapPortion(Number(raw)) }
            : line,
        ),
      };
    });
  }

  const macros = draft ? computeMacros(draft) : null;
  const unitLabel =
    draft?.division_mode === "portions" ? "per portion" : "per oz";

  return (
    <dialog className="container-item" onClose={onClose} ref={dialogRef}>
      <div className="container-item-header">Recipe</div>
      {draft == null ? (
        <div className="container-item-body" />
      ) : isBusy ? (
        <>
          <br />
          <Loader size={1.5} thickness={3} />
        </>
      ) : (
        <div className="container-item-body">
          <ul className="recipe-detail-list">
            <li className="recipe-detail-row">
              <span style={{ fontWeight: 600 }}>Name</span>
              <span>{draft.name}</span>
            </li>
            <li className="recipe-detail-row">
              <span style={{ fontWeight: 600 }}>Division</span>
              <span>
                {draft.division_mode === "portions"
                  ? `${draft.portion_count ?? 0} portions`
                  : "Per ounce"}
              </span>
            </li>
            {draft.division_mode === "per_ounce" ? (
              <li className="recipe-detail-row">
                <span style={{ fontWeight: 600 }}>Total yield (oz)</span>
                <input
                  type="number"
                  className="input create-meal-portion-input"
                  min={MIN_PORTION}
                  step={PORTION_STEP}
                  value={draft.total_yield_oz ?? 0}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            total_yield_oz: snapPortion(Number(e.target.value)),
                          }
                        : prev,
                    )
                  }
                  onFocus={(e) => e.target.select()}
                />
              </li>
            ) : null}
          </ul>

          <div className="create-meal-selected-heading">
            Current batch amounts
          </div>
          {draft.ingredients.map((line) => (
            <div key={line.ingredient_id} className="create-meal-portion-row">
              <span className="portion-name" title={line.name}>
                {line.name}
                <span className="recipe-default-hint">
                  {" "}
                  (default {formatMacro(line.default_amount)})
                </span>
              </span>
              <div className="create-meal-portion-controls">
                <button
                  type="button"
                  className="button"
                  aria-label={`Decrease ${line.name}`}
                  onClick={() => adjustAmount(line.ingredient_id, -PORTION_STEP)}
                >
                  −
                </button>
                <input
                  type="number"
                  className="input create-meal-portion-input"
                  min={MIN_PORTION}
                  step={PORTION_STEP}
                  value={line.current_amount}
                  onChange={(e) =>
                    setAmount(line.ingredient_id, e.target.value)
                  }
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  className="button"
                  aria-label={`Increase ${line.name}`}
                  onClick={() => adjustAmount(line.ingredient_id, PORTION_STEP)}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {macros ? (
            <>
              <div className="recipe-macro-row">
                <div className="recipe-macro-row-label">Macros {unitLabel}</div>
                <div className="accordion-item-macro-grid recipe-macro-summary">
                  <div className="calories color-calories">
                    {formatMacro(macros.perUnit.calories)}
                  </div>
                  <div className="protein color-protein">
                    {formatMacro(macros.perUnit.protein)}
                  </div>
                  <div className="carbohydrates color-carbohydrates">
                    {formatMacro(macros.perUnit.carbohydrates)}
                  </div>
                  <div className="fats color-fats">
                    {formatMacro(macros.perUnit.fats)}
                  </div>
                </div>
              </div>
              <div className="recipe-macro-row">
                <div className="recipe-macro-row-label">Batch total</div>
                <div className="accordion-item-macro-grid recipe-macro-summary">
                  <div className="calories color-calories">
                    {formatMacro(macros.total.calories)}
                  </div>
                  <div className="protein color-protein">
                    {formatMacro(macros.total.protein)}
                  </div>
                  <div className="carbohydrates color-carbohydrates">
                    {formatMacro(macros.total.carbohydrates)}
                  </div>
                  <div className="fats color-fats">
                    {formatMacro(macros.total.fats)}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {error != null ? (
            <p style={{ margin: "8px", color: "var(--bg-error)" }}>{error}</p>
          ) : null}

          <div className="modal-button-container modal-button-container--stacked">
            <div className="modal-button-row">
              <button
                type="button"
                className="button"
                onClick={() => void handleReset()}
              >
                Reset
              </button>
              <button
                type="button"
                className="button"
                onClick={() => void handleSave()}
              >
                Save
              </button>
            </div>
            <div className="modal-button-row">
              <button
                type="button"
                className="button button-danger"
                onClick={() => void handleDelete()}
              >
                Delete
              </button>
              <button type="button" className="button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
