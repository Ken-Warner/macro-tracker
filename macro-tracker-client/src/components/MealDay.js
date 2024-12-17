import { useState, useRef } from "react";

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
  return (
    <div className="accordion-item">
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
  );
}
