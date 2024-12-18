import { useState } from "react";

export default function MealDay({ mealDay, onDeleteMeal }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
        style={isExpanded ? { display: "block" } : { display: "none" }}
      >
        {mealDay.meals.map((meal) => (
          <Meal key={meal.id} meal={meal} onDeleteMeal={onDeleteMeal} />
        ))}
      </div>
    </>
  );
}

function Meal({ meal, onDeleteMeal }) {
  const mealItemDialogId = `mealItem${meal.id}`;

  function handleDeleteMeal() {
    //make fetch call to API to delete the meal
    onDeleteMeal(meal);
  }

  return (
    <>
      <div
        className="accordion-item"
        onClick={() => document.getElementById(mealItemDialogId).showModal()}
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
      <dialog id={mealItemDialogId} className="container-item">
        <div className="container-item-header">{meal.name}</div>
        <div className="container-item-body">
          <ul>
            <li>{meal.time}</li>
            <li>{meal.description}</li>
          </ul>
          <button
            className="button"
            type="button"
            onClick={() => document.getElementById(mealItemDialogId).close()}
          >
            Close
          </button>
          <button className="button" type="button" onClick={handleDeleteMeal}>
            Delete
          </button>
        </div>
      </dialog>
    </>
  );
}
