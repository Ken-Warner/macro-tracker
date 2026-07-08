import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

type PantryIngredient = {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(content: string): PantryIngredient[] {
  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.length > 0 || line.trim()[0] !== "#");
  const ingredients: PantryIngredient[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]!);
    const name = fields[0] ?? "";
    const description = fields[1] ?? "";
    const calories = Number(fields[2]);
    const protein = Number(fields[3]);
    const carbohydrates = Number(fields[4]);
    const fats = Number(fields[5]);

    if (!name || Number.isNaN(calories)) {
      continue;
    }

    ingredients.push({
      name,
      description,
      calories,
      protein,
      carbohydrates,
      fats,
    });
  }

  return ingredients;
}

function formatTsModule(ingredients: PantryIngredient[]): string {
  const entries = ingredients
    .map((ingredient) => {
      return `  {
    name: ${JSON.stringify(ingredient.name)},
    description: ${JSON.stringify(ingredient.description)},
    calories: ${ingredient.calories},
    protein: ${ingredient.protein},
    carbohydrates: ${ingredient.carbohydrates},
    fats: ${ingredient.fats},
  }`;
    })
    .join(",\n");

  return `export type DefaultPantryIngredient = {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

export const DEFAULT_PANTRY_INGREDIENTS: readonly DefaultPantryIngredient[] = [
${entries},
] as const;
`;
}

const csvPath = join(__dirname, "masterMealSheet.csv");
const outputDir = join(__dirname, "../src/data");
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "defaultPantryIngredients.ts");

const csvContent = readFileSync(csvPath, "utf8");
const ingredients = parseCsv(csvContent);
const moduleContent = formatTsModule(ingredients);

writeFileSync(outputPath, moduleContent, "utf8");
console.log(`Wrote ${ingredients.length} ingredients to ${outputPath}`);
