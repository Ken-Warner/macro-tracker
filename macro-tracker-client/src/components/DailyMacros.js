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
      <div
        className="daily-macro-container"
        style={{ border: "3px solid var(--complement)" }}
      >
        <div className="daily-macro-count">{dailyMacros.calories}</div>
        <center className="daily-macro-label">Calories</center>
        <div className="daily-macro-progress-bar">
          <div
            className="daily-macro-progress"
            style={{
              width: (dailyMacros.calories / macroGoals.calories) * 100 + "%",
              backgroundColor: "var(--complement)",
            }}
          ></div>
        </div>
      </div>
      <div
        className="daily-macro-container"
        style={{ border: "3px solid var(--analogous-one)" }}
      >
        <div className="daily-macro-count">{dailyMacros.protein}</div>
        <center className="daily-macro-label">Protein</center>
        <div className="daily-macro-progress-bar">
          <div
            className="daily-macro-progress"
            style={{
              width: (dailyMacros.protein / macroGoals.protein) * 100 + "%",
              backgroundColor: "var(--analogous-one)",
            }}
          ></div>
        </div>
      </div>
      <div
        className="daily-macro-container"
        style={{ border: "3px solid var(--analogous-two)" }}
      >
        <div className="daily-macro-count">{dailyMacros.carbohydrates}</div>
        <center className="daily-macro-label">Carbohydrates</center>
        <div className="daily-macro-progress-bar">
          <div
            className="daily-macro-progress"
            style={{
              width:
                (dailyMacros.carbohydrates / macroGoals.carbohydrates) * 100 +
                "%",
              backgroundColor: "var(--analogous-two)",
            }}
          ></div>
        </div>
      </div>
      <div
        className="daily-macro-container"
        style={{ border: "3px solid var(--analogous-three)" }}
      >
        <div className="daily-macro-count">{dailyMacros.fats}</div>
        <center className="daily-macro-label">Fats</center>
        <div className="daily-macro-progress-bar">
          <div
            className="daily-macro-progress"
            style={{
              width: (dailyMacros.fats / macroGoals.fats) * 100 + "%",
              backgroundColor: "var(--analogous-three)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
