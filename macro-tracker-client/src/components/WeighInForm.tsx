import { useEffect, useReducer, useState } from "react";
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

type TargetMacros = {
  targetCalories: number;
  targetProtein: number;
  targetCarbohydrates: number;
  targetFats: number;
};

const emptyTargets: TargetMacros = {
  targetCalories: 0,
  targetProtein: 0,
  targetCarbohydrates: 0,
  targetFats: 0,
};

type MacroComputeResult =
  | { ok: true; targets: TargetMacros }
  | { ok: false; reason: string };

type WeighInFormState = {
  currentWeight: number;
  goalValue: number;
  date: string;
  lastWeighIn: WeighInData | null;
  mealsSinceLastWeighIn: GetMealHistoryResponse;
  mealsConsistent: boolean;
  targets: TargetMacros;
  macroComputeError: string | null;
  isLoadingInitial: boolean;
  isSubmitting: boolean;
};

type WeighInFormAction =
  | {
      type: "DATA_LOADED";
      lastWeighIn: WeighInData;
      meals: GetMealHistoryResponse;
      mealsConsistent: boolean;
    }
  | { type: "LOAD_FINISHED" }
  | { type: "WEIGHT_CHANGED"; weight: number }
  | { type: "GOAL_CHANGED"; goalValue: number }
  | { type: "DATE_CHANGED"; date: string }
  | { type: "TARGET_CHANGED"; field: keyof TargetMacros; value: number }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_END" };

function todayDateString(): string {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

function mapToRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (!(inMin <= value && value <= inMax))
    throw new Error("Value is not in input range");

  const spaceRatio = (outMax - outMin) / (inMax - inMin);
  let origin = value - inMin;
  origin *= spaceRatio;
  origin += outMin;
  return origin;
}

function areMealsConsistent(meals: GetMealHistoryResponse): boolean {
  const timestamps = meals
    .map((mealDay) => mealDay.mealsDate.split("-"))
    .map(([year, month, day]) =>
      new Date(Number(year), Number(month) - 1, Number(day)).getTime(),
    )
    .sort((a, b) => a - b);

  const oneDay = 24 * 60 * 60 * 1000;
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] !== timestamps[i - 1] + oneDay) {
      return false;
    }
  }
  return true;
}

function computeTargetMacros({
  currentWeight,
  goalValue,
  lastWeighIn,
  mealsSinceLastWeighIn,
}: {
  currentWeight: number;
  goalValue: number;
  lastWeighIn: WeighInData | null;
  mealsSinceLastWeighIn: GetMealHistoryResponse;
}): MacroComputeResult {
  if (currentWeight <= 0) {
    return { ok: false, reason: "Enter a valid current weight." };
  }
  if (!lastWeighIn) {
    return { ok: false, reason: "No previous weigh-in found." };
  }
  if (mealsSinceLastWeighIn.length === 0) {
    return {
      ok: false,
      reason: "No meal history since last weigh-in. Targets cannot be calculated.",
    };
  }

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);

  const lastWeighInDate = new Date(lastWeighIn.date);
  lastWeighInDate.setMinutes(
    lastWeighInDate.getMinutes() - lastWeighInDate.getTimezoneOffset(),
  );

  const daysBetween = Math.max(
    1,
    Math.floor(
      (today.getTime() - lastWeighInDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const totalCalories = mealsSinceLastWeighIn.reduce(
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
    ((lastWeighIn.weight - currentWeight) * 3500 * -1) / daysBetween;

  const maintanenceCalories = caloriesPerDay - calorieSurplusDeficitPerDay;

  const targetCalories =
    Math.round((maintanenceCalories + goalValue) / 50) * 50;

  if (targetCalories < 1200) {
    return {
      ok: false,
      reason: `Calculated calories (${targetCalories}) are below the safe minimum of 1200. Adjust your goal or override targets manually.`,
    };
  }

  const targetProtein = Math.round(
    (goalValue < 0
      ? mapToRange(goalValue, -750, 0, 1, 0.5)
      : mapToRange(goalValue, 0, 750, 0.5, 1.5)) * currentWeight,
  );

  const targetFats = Math.round(
    mapToRange(goalValue, -750, 750, 0.35, 0.5) * currentWeight,
  );

  const targetCarbohydrates =
    Math.round((targetCalories - 4 * targetProtein - 9 * targetFats) / 4 / 5) *
    5;

  return {
    ok: true,
    targets: {
      targetCalories,
      targetProtein,
      targetCarbohydrates,
      targetFats,
    },
  };
}

function withRecalculatedTargets(state: WeighInFormState): WeighInFormState {
  const result = computeTargetMacros({
    currentWeight: state.currentWeight,
    goalValue: state.goalValue,
    lastWeighIn: state.lastWeighIn,
    mealsSinceLastWeighIn: state.mealsSinceLastWeighIn,
  });

  if (result.ok) {
    return { ...state, targets: result.targets, macroComputeError: null };
  }

  return {
    ...state,
    targets: emptyTargets,
    macroComputeError: result.reason,
  };
}

function weighInFormReducer(
  state: WeighInFormState,
  action: WeighInFormAction,
): WeighInFormState {
  switch (action.type) {
    case "DATA_LOADED": {
      const nextState: WeighInFormState = {
        ...state,
        lastWeighIn: action.lastWeighIn,
        mealsSinceLastWeighIn: action.meals,
        mealsConsistent: action.mealsConsistent,
        currentWeight: action.lastWeighIn.weight,
        isLoadingInitial: false,
      };
      return withRecalculatedTargets(nextState);
    }
    case "LOAD_FINISHED":
      return { ...state, isLoadingInitial: false };
    case "WEIGHT_CHANGED":
      return withRecalculatedTargets({
        ...state,
        currentWeight: action.weight,
      });
    case "GOAL_CHANGED":
      return withRecalculatedTargets({ ...state, goalValue: action.goalValue });
    case "DATE_CHANGED":
      return { ...state, date: action.date };
    case "TARGET_CHANGED":
      return {
        ...state,
        targets: { ...state.targets, [action.field]: action.value },
        macroComputeError: null,
      };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true };
    case "SUBMIT_END":
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}

const initialState: WeighInFormState = {
  currentWeight: 0,
  goalValue: 0,
  date: todayDateString(),
  lastWeighIn: null,
  mealsSinceLastWeighIn: [],
  mealsConsistent: true,
  targets: emptyTargets,
  macroComputeError: null,
  isLoadingInitial: true,
  isSubmitting: false,
};

function goalTextFor(goalValue: number): string {
  if (goalValue < -500) return "Aggressively Losing Weight";
  if (goalValue < 0) return "Losing Weight";
  if (goalValue === 0) return "Maintaining Weight";
  if (goalValue < 500) return "Gaining Weight";
  return "Aggressively Gaining Weight";
}

export default function WeighInForm({
  onWeighInSaved,
}: {
  onWeighInSaved?: () => void;
}) {
  const [state, dispatch] = useReducer(weighInFormReducer, initialState);
  const [toast, setToast] = useState<Toast | null>(null);
  const isToastDisplayed = toast != null;

  const isBusy = state.isLoadingInitial || state.isSubmitting;

  useEffect(() => {
    async function fetchData() {
      try {
        const apiResult = await getMostRecentWeighIn();
        if (!apiResult.ok) {
          setToast({
            type: "error",
            message: apiResult.errorMessage,
          });
          dispatch({ type: "LOAD_FINISHED" });
          return;
        }

        const today = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000,
        );
        const lastWeighInDate = new Date(apiResult.body.date);

        const mealHistoryResult = await getMealHistoryFromRange(
          lastWeighInDate,
          today,
        );
        if (!mealHistoryResult.ok) {
          setToast({
            type: "error",
            message: mealHistoryResult.errorMessage,
          });
          dispatch({ type: "LOAD_FINISHED" });
          return;
        }

        dispatch({
          type: "DATA_LOADED",
          lastWeighIn: apiResult.body,
          meals: mealHistoryResult.body,
          mealsConsistent: areMealsConsistent(mealHistoryResult.body),
        });
      } catch {
        setToast({
          type: "error",
          message: "An error occurred retrieving data since last weigh in.",
        });
        dispatch({ type: "LOAD_FINISHED" });
      }
    }

    void fetchData();
  }, []);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    async function submitWeighIn() {
      try {
        dispatch({ type: "SUBMIT_START" });

        const weighInData: weighIn = {
          date: state.date,
          weight: state.currentWeight,
          ...state.targets,
        };

        await postWeighIn(weighInData);
        setToast({ type: "good", message: "New Weigh-In Saved!" });
        onWeighInSaved?.();
      } catch (error) {
        if (error instanceof Error) {
          setToast({ type: "error", message: error.message });
        } else {
          setToast({ type: "error", message: "An unknown error occurred" });
        }
      } finally {
        dispatch({ type: "SUBMIT_END" });
      }
    }

    void submitWeighIn();
  }

  const canSubmit =
    state.currentWeight > 0 &&
    !state.isSubmitting &&
    !state.isLoadingInitial &&
    state.lastWeighIn != null;

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      <div className="weigh-in-form">
        {isBusy && (
          <div className="weigh-in-form__loader">
            <Loader size={3} />
          </div>
        )}
        <div>
          <p>
            Last Weigh-In:{" "}
            {state.lastWeighIn?.date.toLocaleDateString() ?? "—"}
          </p>
          <p>Previous Weight: {state.lastWeighIn?.weight ?? "—"}</p>
          {!state.mealsConsistent && (
            <p>
              There seems to be missing days in your meal history. This is
              going to affect your targets. It is recommended to override them.
            </p>
          )}
          {state.macroComputeError && (
            <p>{state.macroComputeError}</p>
          )}
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="weigh-in-date">Date</label>
          <input
            type="date"
            id="weigh-in-date"
            name="date"
            className="input"
            value={state.date}
            onChange={(e) =>
              dispatch({ type: "DATE_CHANGED", date: e.target.value })
            }
          />
          <label htmlFor="currentWeight">Current Weight</label>
          <input
            type="number"
            id="currentWeight"
            name="currentWeight"
            className="input"
            value={state.currentWeight || ""}
            onChange={(e) =>
              dispatch({
                type: "WEIGHT_CHANGED",
                weight: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
          />
          <label htmlFor="weightObjective">
            Goal: {goalTextFor(state.goalValue)} ({state.goalValue})
          </label>
          <input
            type="range"
            id="weightObjective"
            name="objective"
            className="slider"
            value={state.goalValue}
            onChange={(e) =>
              dispatch({
                type: "GOAL_CHANGED",
                goalValue: Number(e.target.value),
              })
            }
            step={50}
            max={750}
            min={-750}
          />
          <label htmlFor="targetCalories">New Target Calories</label>
          <input
            type="number"
            id="targetCalories"
            name="targetCalories"
            className="input"
            value={state.targets.targetCalories}
            onChange={(e) =>
              dispatch({
                type: "TARGET_CHANGED",
                field: "targetCalories",
                value: Number(e.target.value),
              })
            }
          />
          <label htmlFor="targetProtein">New Target Protein</label>
          <input
            type="number"
            id="targetProtein"
            name="targetProtein"
            className="input"
            value={state.targets.targetProtein}
            onChange={(e) =>
              dispatch({
                type: "TARGET_CHANGED",
                field: "targetProtein",
                value: Number(e.target.value),
              })
            }
          />
          <label htmlFor="targetCarbohydrates">New Target Carbohydrates</label>
          <input
            type="number"
            id="targetCarbohydrates"
            name="targetCarbohydrates"
            className="input"
            value={state.targets.targetCarbohydrates}
            onChange={(e) =>
              dispatch({
                type: "TARGET_CHANGED",
                field: "targetCarbohydrates",
                value: Number(e.target.value),
              })
            }
          />
          <label htmlFor="targetFats">New Target Fats</label>
          <input
            type="number"
            id="targetFats"
            name="targetFats"
            className="input"
            value={state.targets.targetFats}
            onChange={(e) =>
              dispatch({
                type: "TARGET_CHANGED",
                field: "targetFats",
                value: Number(e.target.value),
              })
            }
          />
          <button
            className="button submit"
            type="submit"
            disabled={!canSubmit}
          >
            Accept
          </button>
        </form>
      </div>
    </>
  );
}
