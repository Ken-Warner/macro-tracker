import { useRef, useState } from "react";
import Loader from "./Loader";
import { deleteMeal, putMealRecurring } from "../utilities/api";

export default function MealDay({
  mealDay,
  onDeleteMeal,
  onError,
  onRecurringChange,
  canBeRecurring = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const accordionBody = useRef(null);
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
        style={
          isExpanded
            ? { height: accordionBody.current.scrollHeight + "px" }
            : { height: "0px" }
        }
      >
        {mealDay.meals.map((meal) => (
          <Meal
            key={meal.id}
            meal={meal}
            onDeleteMeal={onDeleteMeal}
            onError={onError}
            onRecurringChange={onRecurringChange}
            canBeRecurring={canBeRecurring}
          />
        ))}
      </div>
    </>
  );
}

function Meal({
  meal,
  onDeleteMeal,
  onError,
  onRecurringChange,
  canBeRecurring = false,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const mealItemModal = useRef(null);

  function handleDeleteMeal() {
    async function fetchDeleteMeal() {
      try {
        onError("");
        const deleted = await deleteMeal(meal.id);

        if (deleted) {
          onDeleteMeal(meal);
        } else {
          onError("This meal could not be deleted.");
        }
      } catch {
        onError("An unexpected error occured.");
      }
    }

    fetchDeleteMeal();
    mealItemModal.current.close();
  }

  function handleSetRecurringMeal() {
    if (isLoading) return;

    async function fetchSetRecurringMeal() {
      try {
        onError("");
        setIsLoading(true);

        const mealUpdated = await putMealRecurring(meal.id, !meal.isRecurring);

        if (mealUpdated) {
          onRecurringChange(meal.id, !meal.isRecurring);
          mealItemModal.current.close();
        } else {
          onError("Meal Not Found");
        }
      } catch {
        onError("Error contacting server");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSetRecurringMeal();
  }

  return (
    <>
      <div
        className="accordion-item"
        onClick={() => mealItemModal.current.showModal()}
      >
        <div className="accordion-item-title">
          {meal.name} at {meal.time}
          {meal.isRecurring ? " (R)" : ""}
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
      <dialog ref={mealItemModal} className="container-item">
        <div className="container-item-header">{meal.name}</div>
        <div className="container-item-body">
          <ul>
            <li>{meal.time}</li>
            <li>{meal.description}</li>
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
          </ul>
          <div className="modal-button-container">
            <button
              className="button"
              type="button"
              onClick={() => mealItemModal.current.close()}
            >
              Close
            </button>
            <button className="button" type="button" onClick={handleDeleteMeal}>
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
