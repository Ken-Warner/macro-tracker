import { useEffect, useState, useRef } from "react";
import Loader from "./Loader";

const tempMealHistory = [
  {
    mealsDate: "2024-12-21",
    meals: [
      {
        id: 2,
        name: "Steak",
        description: "Steak and veggies.",
        date: "2024-12-21",
        time: "16:30:00",
        calories: 554,
        protein: 35,
        carbohydrates: 42,
        fats: 12,
      },
      {
        id: 1,
        name: "Ramen",
        description: "ramen noodles from the package",
        date: "2024-12-21",
        time: "12:30:00",
        calories: 254,
        protein: 11,
        carbohydrates: 34,
        fats: 3,
      },
    ],
  },
  {
    mealsDate: "2024-12-22",
    meals: [
      {
        id: 3,
        name: "Salmon",
        description: "Salmon as in the fish bruh.",
        date: "2024-12-22",
        time: "12:35:00",
        calories: 400,
        protein: 14,
        carbohydrates: 13,
        fats: 20,
      },
    ],
  },
  {
    mealsDate: "2024-12-23",
    meals: [
      {
        id: 3,
        name: "Salmon",
        description: "Salmon as in the fish bruh.",
        date: "2024-12-23",
        time: "12:35:00",
        calories: 600,
        protein: 12,
        carbohydrates: 11,
        fats: 25,
      },
    ],
  },
  {
    mealsDate: "2024-12-24",
    meals: [
      {
        id: 3,
        name: "Salmon",
        description: "Salmon as in the fish bruh.",
        date: "2024-12-24",
        time: "12:35:00",
        calories: 650,
        protein: 22,
        carbohydrates: 0,
        fats: 21,
      },
    ],
  },
  {
    mealsDate: "2024-12-25",
    meals: [
      {
        id: 3,
        name: "Salmon",
        description: "Salmon as in the fish bruh.",
        date: "2024-12-25",
        time: "12:35:00",
        calories: 800,
        protein: 12,
        carbohydrates: 130,
        fats: 21,
      },
    ],
  },
];

const tempLastWeighInData = {
  date: "2024-12-20",
  weight: 135,
  targetCalories: 1700,
  targetProtein: 150,
  targetCarbohydrates: 125,
  targetFats: 65,
};

export default function WeighInForm({ userId, onError }) {
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [goalValue, setGoalValue] = useState(0);

  const weighInForm = useRef(null);
  const mealsSinceLastWeighIn = useRef(tempMealHistory);
  const lastWeighInData = useRef(tempLastWeighInData);

  const goalText =
    goalValue < -500
      ? "Aggressively Losing Weight"
      : goalValue < 0
      ? "Losing Weight"
      : goalValue === "0"
      ? "Maintaining Weight"
      : goalValue < 500
      ? "Gaining Weight"
      : "Aggressively Gaining Weight";

  useEffect(() => {
    async function fetchData() {
      try {
        //Weigh In API Data
        setIsLoading(true);
        onError("");

        const weighInApiResult = await fetch("/api/weighIn/recent");
        const weighInJsonResult = await weighInApiResult.json();

        if (!weighInApiResult.ok) throw new Error();
        lastWeighInData.current = weighInJsonResult;

        //Meals API Data
        const today = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        );

        const lastWeighInDate = new Date(lastWeighInData.current.date);

        const searchParams = new URLSearchParams({
          fromDate: lastWeighInDate.toISOString().split("T")[0],
          toDate: today.toISOString().split("T")[0],
        });

        const mealsApiResult = await fetch(
          `/api/meals/history?${searchParams.toString()}`
        );
        const mealsJsonResult = await mealsApiResult.json();

        if (mealsApiResult.ok) mealsSinceLastWeighIn.current = mealsJsonResult;

        updateTargetMacros();
      } catch {
        onError("An error occurred retrieving data since last weigh in.");
      } finally {
        setIsLoading(false);
        onError("");
      }
    }

    fetchData();
  }, [onError]);

  function handleSubmit(e) {
    e.preventDefault();

    async function fetchPostWeighInData() {
      try {
        onError("");
        setIsLoading(true);

        const formData = {
          weight: weighInForm.current.currentWeight.value,
          date: weighInForm.current.date.value,
          targetCalories: weighInForm.current.elements.targetCalories.value,
          targetCarbohydrates:
            weighInForm.current.elements.targetCarbohydrates.value,
          targetProtein: weighInForm.current.elements.targetProtein.value,
          targetFats: weighInForm.current.elements.targetFats.value,
        };

        const apiResult = await fetch("/api/weighIn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!apiResult.ok) throw new Error();
      } catch {
        onError("Error sending new macro targets.");
      } finally {
        onError("");
        setIsLoading(false);
      }
    }

    //on success either notify user or switch to macro screen or both
    fetchPostWeighInData();
  }

  function handleCurrentWeightChange(e) {
    if (e.target.value.length < 2) return;
    setCurrentWeight(e.target.value);
    updateTargetMacros();
  }

  function handleGoalSliderChange(e) {
    setGoalValue(e.target.value);
    updateTargetMacros();
  }

  function updateTargetMacros() {
    //recalculate all target values based on weight

    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    const lastWeighIn = new Date(lastWeighInData.current.date);
    lastWeighIn.setMinutes(
      lastWeighIn.getMinutes() - lastWeighIn.getTimezoneOffset()
    );

    const daysBetween = (today - lastWeighIn) / (1000 * 60 * 60 * 24);

    const totalCalories = mealsSinceLastWeighIn.current.reduce(
      (mealDayCalories, mealDay) =>
        mealDayCalories +
        mealDay.meals.reduce(
          (mealCalories, meal) => mealCalories + meal.calories,
          0
        ),
      0
    );

    const caloriesPerDay = totalCalories / daysBetween;
    const calorieSurplusDeficitPerDay =
      ((lastWeighInData.current.weight - currentWeight) * 3500) / daysBetween;

    const maintanenceCalories = caloriesPerDay - calorieSurplusDeficitPerDay;
    const targetCalories =
      Math.round((maintanenceCalories + goalValue) / 50) * 50;
    const targetProtein = currentWeight;
    const targetFats = 65;
    const targetCarbohydrates =
      (targetCalories - 4 * targetProtein - 9 * targetFats) / 4;

    weighInForm.current.elements.targetCalories.value = targetCalories;
    weighInForm.current.elements.targetProtein.value = targetProtein;
    weighInForm.current.elements.targetCarbohydrates.value =
      targetCarbohydrates;
    weighInForm.current.elements.targetFats.value = targetFats;
  }

  return (
    <>
      {!isLoading ? (
        <form className="form" onSubmit={handleSubmit} ref={weighInForm}>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            name="date"
            className="input"
            defaultValue={
              new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .split("T")[0]
            }
          />
          <label htmlFor="currentWeight">Current Weight</label>
          <input
            type="number"
            name="currentWeight"
            className="input"
            defaultValue={currentWeight}
            onChange={handleCurrentWeightChange}
          />
          <label htmlFor="weightObjective">
            Goal: {goalText}({goalValue})
          </label>
          <input
            type="range"
            name="objective"
            className="slider"
            value={goalValue}
            onChange={handleGoalSliderChange}
            step={50}
            max={750}
            min={-750}
          />
          <label htmlFor="targetCalories">New Target Calories</label>
          <input
            type="number"
            name="targetCalories"
            className="input"
            defaultValue={0}
          />
          <label htmlFor="targetProtein">New Target Protein</label>
          <input
            type="number"
            name="targetProtein"
            className="input"
            defaultValue={0}
          />
          <label htmlFor="targetCarbohydrates">New Target Carbohydrates</label>
          <input
            type="number"
            name="targetCarbohydrates"
            className="input"
            defaultValue={0}
          />
          <label htmlFor="targetFats">New Target Fats</label>
          <input
            type="number"
            name="targetFats"
            className="input"
            defaultValue={0}
          />
          <button className="button submit" type="submit">
            Accept
          </button>
        </form>
      ) : (
        <Loader size={3} />
      )}
    </>
  );
}
