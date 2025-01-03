import { useEffect, useState, useRef } from "react";
import Loader from "./Loader";

function mapToRange(value, inMin, inMax, outMin, outMax) {
  if (!(inMin <= value && value <= inMax))
    throw new Error("Value is not in input range");

  //find ratio of number lines
  let spaceRatio = (outMax - outMin) / (inMax - inMin);
  //set minimum of input number range to origin
  let origin = value - inMin;
  //scale vector space
  origin *= spaceRatio;
  //translate origin to output space minimum
  origin += outMin;
  return origin;
}

export default function WeighInForm({ onError }) {
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [goalValue, setGoalValue] = useState(0);
  const [mealsConsistent, setMealsConsistent] = useState(true);

  const weighInForm = useRef(null);
  const mealsSinceLastWeighIn = useRef([]);
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
    async function fetchData() {
      try {
        //Weigh In API Data
        setIsLoading(true);
        onError("");

        const weighInApiResult = await fetch("/api/weighIn/recent");
        const weighInJsonResult = await weighInApiResult.json();

        if (!weighInApiResult.ok) throw new Error();
        lastWeighInData.current = weighInJsonResult;
        setCurrentWeight(lastWeighInData.weight);

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

        const timestamps = mealsJsonResult
          .map((mealDay) => mealDay.mealsDate.split("-"))
          .map(([day, month, year]) => new Date(year, month, day).getTime())
          .sort();
        let consistent = true;
        const oneDay = 24 * 60 * 60 * 1000;
        for (const timestamp in timestamps)
          if (timestamps[timestamp] !== timestamps[timestamp - 1] + oneDay) {
            consistent = false;
            break;
          }
        setMealsConsistent(consistent);
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
  }

  useEffect(() => {
    if (currentWeight <= 0) return;
    if (!weighInForm.current) return;
    if (mealsSinceLastWeighIn.current.length === 0) return;

    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    const lastWeighIn = new Date(lastWeighInData.current.date);
    lastWeighIn.setMinutes(
      lastWeighIn.getMinutes() - lastWeighIn.getTimezoneOffset()
    );

    const daysBetween = Math.floor(
      (today - lastWeighIn) / (1000 * 60 * 60 * 24)
    );

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
      ((lastWeighInData.current.weight - currentWeight) * 3500 * -1) /
      daysBetween;

    const maintanenceCalories = caloriesPerDay - calorieSurplusDeficitPerDay;

    const targetCalories =
      Math.round((maintanenceCalories + Number(goalValue)) / 50) * 50;
    if (targetCalories < 1200) return;

    const targetProtein = Math.round(
      (goalValue < 0
        ? mapToRange(goalValue, -750, 0, 1, 0.5)
        : mapToRange(goalValue, 0, 750, 0.5, 1.5)) * currentWeight
    );

    const targetFats = Math.round(
      mapToRange(goalValue, -750, 750, 0.35, 0.5) * currentWeight
    );

    const targetCarbohydrates =
      Math.round(
        (targetCalories - 4 * targetProtein - 9 * targetFats) / 4 / 5
      ) * 5;

    weighInForm.current.elements.targetCalories.value = targetCalories;
    weighInForm.current.elements.targetProtein.value = targetProtein;
    weighInForm.current.elements.targetCarbohydrates.value =
      targetCarbohydrates;
    weighInForm.current.elements.targetFats.value = targetFats;
  }, [goalValue, currentWeight]);

  return (
    <>
      {!isLoading ? (
        <>
          <div>
            <p>Last Weigh-In: {lastWeighInData.current.date}</p>
            <p>Previous Weight: {lastWeighInData.current.weight}</p>
            {!mealsConsistent && (
              <p>
                There seems to be missing days in your meal history. This is
                going to affect your targets. It is recommended to override
                them.
              </p>
            )}
          </div>
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
              onChange={(e) => setGoalValue(e.target.value)}
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
            <label htmlFor="targetCarbohydrates">
              New Target Carbohydrates
            </label>
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
        </>
      ) : (
        <Loader size={3} />
      )}
    </>
  );
}
