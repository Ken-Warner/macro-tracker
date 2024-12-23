import { useEffect, useState, useRef } from "react";
import Loader from "./Loader";

export default function WeighInForm({ userId }) {
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isMealsLoading, setIsMealsLoading] = useState(false);
  const [isWeighInLoading, setIsWeighInLoading] = useState(false);
  const [goalValue, setGoalValue] = useState(0);

  const weighInForm = useRef(null);
  const mealsSinceLastWeighIn = useRef({});
  const lastWeighInData = useRef({});

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
    async function fetchLastWeighInData() {
      //weight in api result:
      //{"date":"2024-12-11","weight":135,"targetCalories":1700,"targetProtein":0,"targetCarbohydrates":0,"targetFats":0}
      try {
        setIsWeighInLoading(true);
      } catch {
        //todo
      } finally {
        setIsWeighInLoading(false);
      }
    }

    async function fetchMealsSinceLastWeighIn() {
      try {
        setIsMealsLoading(true);
      } catch {
        //todo
      } finally {
        setIsMealsLoading(false);
      }
    }

    fetchLastWeighInData();
    fetchMealsSinceLastWeighIn();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    //make API call to save new weight and target macro data

    //on success either notify user or switch to macro screen or both
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
    //set values using form ref
    weighInForm.current.elements.targetCalories.value = "10";
    weighInForm.current.elements.targetProtein.value = "11";
    weighInForm.current.elements.targetCarbohydrates.value = "12";
    weighInForm.current.elements.targetFats.value = "13";
  }

  return (
    <>
      {!isMealsLoading && !isWeighInLoading ? (
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
