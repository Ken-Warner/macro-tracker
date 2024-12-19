import { useRef, useState } from "react";

export default function MealDay({ mealDay, onDeleteMeal, onError }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const accordionBody = useRef(null);

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
        Meals For {mealDay.mealsDate}
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
          />
        ))}
      </div>
    </>
  );
}

function Meal({ meal, onDeleteMeal, onError }) {
  const mealItemModal = useRef(null);

  function handleDeleteMeal() {
    async function fetchDeleteMeal() {
      try {
        onError("");

        const apiResult = await fetch(`/api/meals/${meal.id}`, {
          method: "DELETE",
        });

        if (apiResult.ok) {
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

  return (
    <>
      <div
        className="accordion-item"
        onClick={() => mealItemModal.current.showModal()}
      >
        <div className="accordion-item-title">
          {meal.name} at {meal.time}
        </div>
        <div className="accordion-item-macro-grid">
          <div className="calories">{meal.calories}</div>
          <div className="protein">{meal.protein}</div>
          <div className="carbohydrates">{meal.carbohydrates}</div>
          <div className="fats">{meal.fats}</div>
        </div>
      </div>
      <dialog ref={mealItemModal} className="container-item">
        <div className="container-item-header">{meal.name}</div>
        <div className="container-item-body">
          <ul>
            <li>{meal.time}</li>
            <li>{meal.description}</li>
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
