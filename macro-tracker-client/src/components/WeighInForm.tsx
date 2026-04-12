import { useEffect, useState, useRef } from "react";
import Loader from "./Loader";
import ToastMessage, { type Toast } from "./reusables/ToastMessage";
import {
  getMostRecentWeighIn,
  getMealHistoryFromRange,
  postWeighIn,
} from "../utilities/api";
import {
  type GetMealHistoryResponse,
  WeighInData,
} from "@macro-tracker/macro-tracker-shared";
import type { weighIn } from "../types/weighIn";

/* TODO
 - Still erroring on load and submit for some reason. Needs to be fixed and debugged.
*/

function mapToRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (!(inMin <= value && value <= inMax))
    throw new Error("Value is not in input range");

  //find ratio of number lines
  const spaceRatio = (outMax - outMin) / (inMax - inMin);
  //set minimum of input number range to origin
  let origin = value - inMin;
  //scale vector space
  origin *= spaceRatio;
  //translate origin to output space minimum
  origin += outMin;
  return origin;
}

export default function WeighInForm() {
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [goalValue, setGoalValue] = useState(0);
  const [mealsConsistent, setMealsConsistent] = useState(true);

  const [toast, setToast] = useState<Toast | null>(null);
  const isToastDisplayed = toast != null;

  const weighInForm = useRef<HTMLFormElement>(null);
  const mealsSinceLastWeighIn = useRef<GetMealHistoryResponse>([]);
  const lastWeighInData = useRef<WeighInData>(null);

  const goalText =
    goalValue < -500
      ? "Aggressively Losing Weight"
      : goalValue < 0
        ? "Losing Weight"
        : goalValue === 0
          ? "Maintaining Weight"
          : goalValue < 500
            ? "Gaining Weight"
            : "Aggressively Gaining Weight";

  useEffect(() => {
    async function fetchData() {
      try {
        //Weigh In API Data
        setIsLoading(true);

        const apiResult = await getMostRecentWeighIn();
        if (!apiResult.ok) {
          return;
        }
        lastWeighInData.current = apiResult.body;

        //Meals API Data
        const today = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000,
        );

        const lastWeighInDate = new Date(lastWeighInData.current.date);

        const mealHistoryResult = await getMealHistoryFromRange(
          lastWeighInDate,
          today,
        );
        if (mealHistoryResult.ok) {
          mealsSinceLastWeighIn.current = mealHistoryResult.body;
        } else {
          return;
        }

        const timestamps = mealsSinceLastWeighIn.current
          .map((mealDay) => mealDay.mealsDate.split("-"))
          .map(([day, month, year]) =>
            new Date(Number(year), Number(month), Number(day)).getTime(),
          )
          .sort();
        let consistent = true;
        const oneDay = 24 * 60 * 60 * 1000;
        for (const timestamp in timestamps)
          if (
            timestamps[timestamp] !==
            timestamps[Number(timestamp) - 1] + oneDay
          ) {
            consistent = false;
            break;
          }
        setMealsConsistent(consistent);
        setCurrentWeight(apiResult.body.weight);
      } catch {
        setToast({
          type: "error",
          message: "An error occurred retrieving data since last weigh in.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    async function fetchPostWeighInData() {
      if (!weighInForm.current) return;

      try {
        setIsLoading(true);

        const formData = new FormData(weighInForm.current);
        const weighInData: weighIn = {
          date: new Date(String(formData.get("date"))),
          weight: Number(formData.get("currentWeight")),
          targetCalories: Number(formData.get("targetCalories")),
          targetProtein: Number(formData.get("targetProtein")),
          targetCarbohydrates: Number(formData.get("targetCarbohydrates")),
          targetFats: Number(formData.get("targetFats")),
        };

        await postWeighIn(weighInData);
        setToast({ type: "good", message: "New Weigh-In Saved!" });
      } catch (error) {
        if (error instanceof Error) {
          setToast({ type: "error", message: error.message });
        } else {
          setToast({ type: "error", message: "An unknown error occurred" });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchPostWeighInData();
  }

  function handleCurrentWeightChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length < 2) return;
    setCurrentWeight(Number(e.target.value));
  }

  useEffect(() => {
    if (currentWeight <= 0) return;
    if (!weighInForm.current) return;
    if (mealsSinceLastWeighIn.current.length === 0) return;
    if (!lastWeighInData.current) return;

    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

    const lastWeighIn = new Date(lastWeighInData.current.date);
    lastWeighIn.setMinutes(
      lastWeighIn.getMinutes() - lastWeighIn.getTimezoneOffset(),
    );

    const daysBetween = Math.floor(
      (today.getTime() - lastWeighIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    const totalCalories = mealsSinceLastWeighIn.current.reduce(
      (mealDayCalories, mealDay) =>
        mealDayCalories +
        mealDay.meals.reduce(
          (mealCalories, meal) => mealCalories + meal.calories,
          0,
        ),
      0,
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
        : mapToRange(goalValue, 0, 750, 0.5, 1.5)) * currentWeight,
    );

    const targetFats = Math.round(
      mapToRange(goalValue, -750, 750, 0.35, 0.5) * currentWeight,
    );

    const targetCarbohydrates =
      Math.round(
        (targetCalories - 4 * targetProtein - 9 * targetFats) / 4 / 5,
      ) * 5;

    const elements = weighInForm.current
      .elements as HTMLFormControlsCollection & {
      targetCalories: HTMLInputElement;
      targetProtein: HTMLInputElement;
      targetCarbohydrates: HTMLInputElement;
      targetFats: HTMLInputElement;
    };

    elements.targetCalories.value = targetCalories.toString();
    elements.targetProtein.value = targetProtein.toString();
    elements.targetCarbohydrates.value = targetCarbohydrates.toString();
    elements.targetFats.value = targetFats.toString();
  }, [goalValue, currentWeight]);

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      {!isLoading ? (
        <>
          <div>
            <p>
              Last Weigh-In:{" "}
              {lastWeighInData.current?.date.toLocaleDateString()}
            </p>
            <p>Previous Weight: {lastWeighInData.current?.weight}</p>
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
              onChange={(e) => setGoalValue(Number(e.target.value))}
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
