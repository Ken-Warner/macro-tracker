import MacroProgressBar from "./MacroProgressBar";

export default function DailyMacros({ dailyMacros, macroTargets }) {
  return (
    <div className="daily-macros-container">
      <MacroProgressBar
        macroColor={"var(--complement)"}
        macroLabel={"Calories"}
        currentMacroValue={dailyMacros.calories}
        targetMacroValue={macroTargets.targetCalories}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-one)"}
        macroLabel={"Protein"}
        currentMacroValue={dailyMacros.protein}
        targetMacroValue={macroTargets.targetProtein}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-two)"}
        macroLabel={"Carbohydrates"}
        currentMacroValue={dailyMacros.carbohydrates}
        targetMacroValue={macroTargets.targetCarbohydrates}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-three)"}
        macroLabel={"Fats"}
        currentMacroValue={dailyMacros.fats}
        targetMacroValue={macroTargets.targetFats}
      />
    </div>
  );
}
