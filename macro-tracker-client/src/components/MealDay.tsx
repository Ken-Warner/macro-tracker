import { useRef, useState, useEffect, useLayoutEffect } from "react";
import type { MealHistoryDayGroup } from "@macro-tracker/macro-tracker-shared";
import type { Meal } from "../types/meal";
import Loader from "./Loader";
import MacroProgressBar from "./MacroProgressBar";
import ToastMessage, { type Toast } from "./reusables/ToastMessage";
import { deleteMeal, putMealRecurring } from "../utilities/api";

function formatMealTime(time: string): string {
  const [hourPart, minutePart = "0"] = time.split(":");
  const hours = Number(hourPart);
  const minutes = Number(minutePart);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

type MealDayProps = {
  mealDay: MealHistoryDayGroup;
  onDeleteMeal: (meal: Meal) => void;
  onRecurringChange: (mealId: number, isRecurring: boolean) => void;
  canBeRecurring?: boolean;
  handleSetCopyMeal: (meal: Meal) => void;
  expanded: boolean;
};

type MealItemProps = {
  meal: Meal;
  onDeleteMeal: (meal: Meal) => void;
  onRecurringChange: (mealId: number, isRecurring: boolean) => void;
  canBeRecurring?: boolean;
  handleSetCopyMeal: (meal: Meal) => void;
};

function toMeal(meal: MealHistoryDayGroup["meals"][number]): Meal {
  return {
    id: meal.id ?? 0,
    name: meal.name,
    description: meal.description ?? "",
    date: meal.date,
    time: meal.time ?? "",
    calories: meal.calories,
    protein: meal.protein,
    carbohydrates: meal.carbohydrates,
    fats: meal.fats,
    isRecurring: Boolean(meal.isRecurring ?? meal.is_recurring),
  };
}

export default function MealDay({
  mealDay,
  onDeleteMeal,
  onRecurringChange,
  canBeRecurring = false,
  handleSetCopyMeal,
  expanded,
}: MealDayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(0);
  const accordionBody = useRef<HTMLDivElement>(null);
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbohydrates = 0;
  let totalFats = 0;

  mealDay.meals.forEach((meal) => {
    totalCalories += meal.calories;
    totalProtein += meal.protein;
    totalCarbohydrates += meal.carbohydrates;
    totalFats += meal.fats;
  });

  useEffect(() => {
    setIsExpanded(expanded);
  }, [expanded]);

  useLayoutEffect(() => {
    const el = accordionBody.current;
    if (!el) return;
    setBodyHeight(isExpanded ? el.scrollHeight : 0);
  }, [isExpanded, mealDay.meals]);

  return (
    <>
      <button
        className={
          isExpanded
            ? "accordion-header accordion-header-selected"
            : "accordion-header"
        }
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <span
          className={isExpanded ? "accordion-icon rotate90" : "accordion-icon"}
        >
          ▶
        </span>
        Meals For {mealDay.mealsDate}{" "}
        <span className="color-calories">{totalCalories}</span>&nbsp;
        <span className="color-protein">{totalProtein}</span>&nbsp;
        <span className="color-carbohydrates">{totalCarbohydrates}</span>&nbsp;
        <span className="color-fats">{totalFats}</span>&nbsp;
      </button>
      <div
        className="accordion-body"
        ref={accordionBody}
        style={{ height: `${bodyHeight}px` }}
      >
        {mealDay.meals.map((meal) => (
          <MealItem
            key={meal.id ?? `${meal.name}-${meal.time}`}
            meal={toMeal(meal)}
            onDeleteMeal={onDeleteMeal}
            onRecurringChange={onRecurringChange}
            canBeRecurring={canBeRecurring}
            handleSetCopyMeal={handleSetCopyMeal}
          />
        ))}
      </div>
    </>
  );
}

function MealItem({
  meal,
  onDeleteMeal,
  onRecurringChange,
  canBeRecurring = false,
  handleSetCopyMeal,
}: MealItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mealItemModal = useRef<HTMLDialogElement>(null);

  const [toast, setToast] = useState<Toast | null>(null);
  const isToastDisplayed = toast != null;

  useEffect(() => {
    if (!isModalOpen) return;
    mealItemModal.current?.showModal();
  }, [isModalOpen]);

  function handleDeleteMeal() {
    async function fetchDeleteMeal() {
      try {
        const deleted = await deleteMeal(meal.id);

        if (deleted) {
          onDeleteMeal(meal);
        } else {
          setToast({
            type: "error",
            message: "This meal could not be deleted.",
          });
        }
      } catch {
        setToast({ type: "error", message: "An unexpected error occured." });
      }
    }

    void fetchDeleteMeal();
    mealItemModal.current?.close();
  }

  function handleSetRecurringMeal() {
    if (isLoading) return;

    async function fetchSetRecurringMeal() {
      try {
        setIsLoading(true);

        const mealUpdated = await putMealRecurring(meal.id, !meal.isRecurring);

        if (mealUpdated) {
          onRecurringChange(meal.id, !meal.isRecurring);
          mealItemModal.current?.close();
        } else {
          setToast({ type: "error", message: "Meal not found" });
        }
      } catch {
        setToast({ type: "error", message: "Error contacting server" });
      } finally {
        setIsLoading(false);
      }
    }

    void fetchSetRecurringMeal();
  }

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      <div className="accordion-item" onClick={() => setIsModalOpen(true)}>
        <div className="accordion-item-title">
          {meal.name} at {formatMealTime(meal.time)}&nbsp;
          {meal.isRecurring ? <sub>🔁</sub> : ""}
        </div>
        <div className="accordion-item-macro-grid">
          <div className="calories color-calories">{meal.calories}</div>
          <div className="protein color-protein">{meal.protein}</div>
          <div className="carbohydrates color-carbohydrates">
            {meal.carbohydrates}
          </div>
          <div className="fats color-fats">{meal.fats}</div>
        </div>
      </div>
      {isModalOpen ? (
        <dialog
          ref={mealItemModal}
          className="container-item"
          onClose={() => setIsModalOpen(false)}
        >
          <div className="container-item-header">{meal.name}</div>
          <div className="container-item-body">
            <div className="daily-macros-container">
              <MacroProgressBar
                macroColor="var(--complement)"
                macroLabel="Calories"
                currentMacroValue={meal.calories}
                targetMacroValue={0}
              />
              <MacroProgressBar
                macroColor="var(--analogous-one)"
                macroLabel="Protein"
                currentMacroValue={meal.protein}
                targetMacroValue={0}
              />
              <MacroProgressBar
                macroColor="var(--analogous-two)"
                macroLabel="Carbohydrates"
                currentMacroValue={meal.carbohydrates}
                targetMacroValue={0}
              />
              <MacroProgressBar
                macroColor="var(--analogous-three)"
                macroLabel="Fats"
                currentMacroValue={meal.fats}
                targetMacroValue={0}
              />
            </div>
            {meal.time ? (
              <div className="meal-modal-time">{formatMealTime(meal.time)}</div>
            ) : null}
            <p className="meal-modal-description">{meal.description}</p>
            <ul>
              {canBeRecurring && (
                <li>
                  <button
                    className="button"
                    onClick={() => handleSetRecurringMeal()}
                  >
                    {isLoading ? (
                      <Loader size={1.15} thickness={4} />
                    ) : (
                      "Toggle Recurring"
                    )}
                  </button>
                </li>
              )}
              <li>
                <button
                  className="button"
                  onClick={() => {
                    handleSetCopyMeal(meal);
                    mealItemModal.current?.close();
                  }}
                >
                  Copy
                </button>
              </li>
            </ul>
            <div className="modal-button-container">
              <button
                className="button"
                type="button"
                onClick={() => mealItemModal.current?.close()}
              >
                Close
              </button>
              <button
                className="button"
                type="button"
                onClick={handleDeleteMeal}
              >
                Delete
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
