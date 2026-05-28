import type { MacroData, WeighInData } from "@macro-tracker/macro-tracker-shared";
import MacroProgressBar from "./MacroProgressBar";

type DailyMacrosProps = {
  dailyMacros: MacroData;
  macroTargets: WeighInData | null;
};

export default function DailyMacros({
  dailyMacros,
  macroTargets,
}: DailyMacrosProps) {
  return (
    <div className="daily-macros-container">
      <MacroProgressBar
        macroColor={"var(--complement)"}
        macroLabel={"Calories"}
        currentMacroValue={dailyMacros.calories}
        targetMacroValue={macroTargets?.targetCalories ?? 0}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-one)"}
        macroLabel={"Protein"}
        currentMacroValue={dailyMacros.protein}
        targetMacroValue={macroTargets?.targetProtein ?? 0}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-two)"}
        macroLabel={"Carbohydrates"}
        currentMacroValue={dailyMacros.carbohydrates}
        targetMacroValue={macroTargets?.targetCarbohydrates ?? 0}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-three)"}
        macroLabel={"Fats"}
        currentMacroValue={dailyMacros.fats}
        targetMacroValue={macroTargets?.targetFats ?? 0}
      />
    </div>
  );
}
