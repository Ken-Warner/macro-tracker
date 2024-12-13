import { useState } from "react";

export default function MealDay({ mealDay, onDeleteMeal }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <button
        style={{ display: "block" }}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        Meals For {mealDay.mealsDate}
      </button>
      <div style={isExpanded ? { display: "block" } : { display: "none" }}>
        {mealDay.meals.map((meal) => (
          <Meal key={meal.id} meal={meal} onDeleteMeal={onDeleteMeal} />
        ))}
      </div>
    </>
  );
}

function Meal({ meal, onDeleteMeal }) {
  return (
    <p>
      {meal.name} at {meal.time}
    </p>
  );
}
