export default function MacroProgressBar({
  currentMacroValue,
  targetMacroValue,
  macroLabel,
  macroColor,
}) {
  const targetsSet = targetMacroValue > 0;
  const progressPercentage =
    currentMacroValue > targetMacroValue
      ? 100 + "%"
      : (currentMacroValue / targetMacroValue) * 100 + "%";

  return (
    <div
      className="daily-macro-container"
      style={{ border: `3px solid ${macroColor}` }}
    >
      <div className="daily-macro-count">
        {currentMacroValue}
        {targetsSet && <span>/{targetMacroValue}</span>}
      </div>
      <center className="daily-macro-label">{macroLabel}</center>
      {targetsSet && (
        <div className="daily-macro-progress-bar">
          <div
            className="daily-macro-progress"
            style={{
              width: progressPercentage,
              backgroundColor: macroColor,
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
