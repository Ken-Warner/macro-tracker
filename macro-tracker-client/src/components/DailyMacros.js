import MacroProgressBar from "./MacroProgressBar";

//temporary, idk if this should be global state or not
const macroGoals = {
  calories: 1700,
  protein: 120,
  carbohydrates: 125,
  fats: 65,
};

export default function DailyMacros({ dailyMacros }) {
  return (
    <div className="daily-macros-container">
      <MacroProgressBar
        macroColor={"var(--complement)"}
        macroLabel={"Calories"}
        currentMacroValue={dailyMacros.calories}
        targetMacroValue={macroGoals.calories}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-one)"}
        macroLabel={"Protein"}
        currentMacroValue={dailyMacros.protein}
        targetMacroValue={macroGoals.protein}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-two)"}
        macroLabel={"Carbohydrates"}
        currentMacroValue={dailyMacros.carbohydrates}
        targetMacroValue={macroGoals.carbohydrates}
      />
      <MacroProgressBar
        macroColor={"var(--analogous-three)"}
        macroLabel={"Fats"}
        currentMacroValue={dailyMacros.fats}
        targetMacroValue={macroGoals.fats}
      />
    </div>
  );
}
