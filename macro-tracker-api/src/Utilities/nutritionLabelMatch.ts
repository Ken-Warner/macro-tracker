import type { GetIngredientFromImageResponse } from "@macro-tracker/macro-tracker-shared";

const gap = String.raw`[\s.:]*`;
// `g` must not be the start of a word (e.g. "120 GAT"); `mg`/`kcal` likewise.
const amount = String.raw`(?<value>\d+[.,]?\d*)\s*(?<unit>kcal|mg|g(?![a-z])|%|[9q](?!\d))?`;

const caloriePatterns = [
  new RegExp(String.raw`\bCalor[i1l]es?(?!\s+from)${gap}${amount}`, "i"),
  new RegExp(
    String.raw`\bEnergy\b[\s\S]*?(?<value>\d+[.,]?\d*)\s*(?<unit>kcal)\b`,
    "i",
  ),
  new RegExp(String.raw`(?<value>\d{1,5})\s*(?<unit>kcal)\b`, "i"),
];

const proteinPatterns = [
  new RegExp(String.raw`\bProte[i1l]ns?${gap}${amount}`, "i"),
];

const carbohydratePatterns = [
  new RegExp(String.raw`(?:Total\s*)?Carbohydrates?${gap}${amount}`, "i"),
  new RegExp(String.raw`\bCarbs\b${gap}${amount}`, "i"),
];

const fatPatterns = [
  new RegExp(String.raw`\bTotal\s*Fats?${gap}${amount}`, "i"),
  new RegExp(
    String.raw`(?<!(?:Saturated|Trans|Polyunsaturated|Monounsaturated|from)\s+)Fats?\b${gap}${amount}`,
    "i",
  ),
];

export function patternMatchText(text: string): GetIngredientFromImageResponse {
  const normalized = text.replace(/\s+/g, " ").trim();

  const calories = firstAmount(normalized, caloriePatterns, "calories");
  const protein = firstAmount(normalized, proteinPatterns, "grams");
  const carbohydrates = firstAmount(normalized, carbohydratePatterns, "grams");
  const fats = firstAmount(normalized, fatPatterns, "grams");

  return {
    success:
      calories !== null ||
      protein !== null ||
      carbohydrates !== null ||
      fats !== null,
    calories: calories ?? 0,
    protein: protein ?? 0,
    carbohydrates: carbohydrates ?? 0,
    fats: fats ?? 0,
  };
}

function firstAmount(
  text: string,
  patterns: readonly RegExp[],
  kind: "calories" | "grams",
): number | null {
  for (const pattern of patterns) {
    const global = new RegExp(
      pattern.source,
      pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`,
    );
    for (const match of text.matchAll(global)) {
      const parsed = parseAmount(match, kind);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function parseAmount(
  match: RegExpMatchArray,
  kind: "calories" | "grams",
): number | null {
  const valueRaw = match.groups?.value;
  if (valueRaw === undefined || valueRaw === "") return null;

  const unit = match.groups?.unit?.toLowerCase() ?? "";

  if (kind === "calories") {
    if (
      unit === "%" ||
      unit === "mg" ||
      unit === "g" ||
      unit === "9" ||
      unit === "q"
    ) {
      return null;
    }
  } else if (unit === "%" || unit === "mg" || unit === "kcal") {
    return null;
  }

  const gluedDecimal = repairGluedOcrDecimalGrams(valueRaw, unit, match[0]);
  if (kind === "grams" && gluedDecimal !== null) return gluedDecimal;

  const n = Number.parseFloat(valueRaw.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/** `Total Fat459` from `4.5g`: decimal dropped and trailing `g` read as `9`. */
function repairGluedOcrDecimalGrams(
  valueRaw: string,
  unit: string,
  matchedText: string,
): number | null {
  if (unit !== "" && unit !== "9" && unit !== "q") return null;
  if (!/^\d{3}$/.test(valueRaw) || !valueRaw.endsWith("9")) return null;
  if (!/[a-z]\d/i.test(matchedText)) return null;
  const repaired = Number.parseFloat(`${valueRaw[0]}.${valueRaw[1]}`);
  if (!Number.isFinite(repaired)) return null;
  return repaired;
}
