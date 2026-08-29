import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { patternMatchText } from "./nutritionLabelMatch.ts";

describe("patternMatchText", () => {
  it("parses a clean FDA Nutrition Facts block", () => {
    const text = `
      Nutrition Facts
      Serving Size 2/3 cup (55g)
      Calories 230
      Total Fat 8g 10%
      Saturated Fat 1g 5%
      Trans Fat 0g
      Cholesterol 0mg
      Sodium 160mg 7%
      Total Carbohydrate 37g 13%
      Dietary Fiber 4g 14%
      Total Sugars 12g
      Protein 3g
    `;

    assert.deepEqual(patternMatchText(text), {
      success: true,
      calories: 230,
      protein: 3,
      carbohydrates: 37,
      fats: 8,
    });
  });

  it("treats newlines, colons, and leader dots as gaps", () => {
    const text = [
      "Calories ...... 150",
      "Total Fat:",
      "12g",
      "Total Carbohydrate 21g",
      "Protein 5g",
    ].join("\n");

    assert.deepEqual(patternMatchText(text), {
      success: true,
      calories: 150,
      protein: 5,
      carbohydrates: 21,
      fats: 12,
    });
  });

  it("does not use Calories from Fat or saturated/trans rows", () => {
    const text = `
      Calories 250
      Calories from Fat 110
      Saturated Fat 3g
      Trans Fat 1g
      Protein 9g
    `;

    assert.deepEqual(patternMatchText(text), {
      success: true,
      calories: 250,
      protein: 9,
      carbohydrates: 0,
      fats: 0,
    });
  });

  it("prefers gram amounts over % Daily Value", () => {
    const text = `
      Calories 90
      Total Fat 12g 15%
      Total Carbohydrate 37g 13%
      Protein 5g 10%
    `;

    assert.deepEqual(patternMatchText(text), {
      success: true,
      calories: 90,
      protein: 5,
      carbohydrates: 37,
      fats: 12,
    });
  });

  it("does not treat a % Daily Value as the macro when grams are missing", () => {
    const text = `
      Calories 90
      Total Fat 15%
      Protein 10%
    `;

    assert.deepEqual(patternMatchText(text), {
      success: true,
      calories: 90,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
    });
  });

  it("accepts Carbs and Total Carbohydrates aliases", () => {
    assert.equal(patternMatchText("Carbs 18g").carbohydrates, 18);
    assert.equal(
      patternMatchText("Total Carbohydrates 22g").carbohydrates,
      22,
    );
  });

  it("accepts Fat without Total when it is not a sub-row", () => {
    assert.equal(patternMatchText("Fat 7g Protein 2g").fats, 7);
    assert.equal(patternMatchText("Fats 7g").fats, 7);
  });

  it("parses decimal gram values", () => {
    const result = patternMatchText("Total Fat 2.5g Protein 0.5g");
    assert.equal(result.fats, 2.5);
    assert.equal(result.protein, 0.5);
    assert.equal(result.success, true);
  });

  it("tolerates common Tesseract substitutions", () => {
    const text = `
      Calorles 230
      Total Fat 8 9 10%
      Total Carbohydrate 37g
      Prote1n 3g
    `;

    assert.deepEqual(patternMatchText(text), {
      success: true,
      calories: 230,
      protein: 3,
      carbohydrates: 37,
      fats: 8,
    });
  });

  it("uses the first number on dual-column per-serving / per-container labels", () => {
    const text = `
      Calories 230 460
      Total Fat 8g 16g
      Total Carbohydrate 37g 74g
      Protein 3g 6g
    `;

    assert.deepEqual(patternMatchText(text), {
      success: true,
      calories: 230,
      protein: 3,
      carbohydrates: 37,
      fats: 8,
    });
  });

  it("falls back to Energy kcal when Calories is absent", () => {
    const result = patternMatchText("Energy 960 kJ / 230 kcal Protein 4g");
    assert.equal(result.success, true);
    assert.equal(result.calories, 230);
    assert.equal(result.protein, 4);
  });

  it("marks success when only one field is extracted", () => {
    assert.deepEqual(patternMatchText("Calories 180"), {
      success: true,
      calories: 180,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
    });
  });

  it("treats an extracted 0g as success", () => {
    assert.deepEqual(patternMatchText("Total Fat 0g"), {
      success: true,
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
    });
  });

  it("returns unsuccessful zeros when nothing matches", () => {
    assert.deepEqual(patternMatchText("hello world"), {
      success: false,
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
    });
  });

  it("does not treat a following word like GAT as a gram unit on calories", () => {
    assert.deepEqual(patternMatchText("calories 120 GAT"), {
      success: true,
      calories: 120,
      protein: 0,
      carbohydrates: 0,
      fats: 0,
    });
  });

  it("parses a noisy Tesseract dump from a real label photo", () => {
    const text =
      "Ir mo F INGREDIENTS\n" +
      "\n" +
      "Nulrition Facts EAM\n" +
      "\n" +
      "7 servings per container Ts\n" +
      "\n" +
      "Serving size 1 cup 240mlL canis\n" +
      "\n" +
      "j / Amount per serving oe\n" +
      "\n" +
      "calories 120 GAT\n" +
      "\n" +
      "IESE NE 9, Daily Value 0 tt\n" +
      "\n" +
      "Total Fat459 - 6% FSHAKEWEL\n" +
      "Saturated Fat 25g 13% -\n" +
      "\n" +
      "TransFatOg-\n" +
      "\n" +
      "Cholesterol 25mg. 8%\n" +
      "Sodium60mg 3%\n" +
      "Total Carbohydrate 7g- 3%\n" +
      "\n" +
      ": Dietary Fiber0g- - -. 0%\n" +
      "\n" +
      "Co Total Sugars 7g\n" +
      "\n" +
      "Includes 0g Added Sugars 0%\n" +
      "\n" +
      ". Protein 14g . 28%\n" +
      "\n" +
      "BE A seems waa\n" +
      "\n" +
      "d Vitamin D 3meg 15%\n" +
      "Calcium 408mg 30%\n" +
      "Iron Omg 0% j\n" +
      "\n" +
      "oo TTT A\n";

    assert.deepEqual(patternMatchText(text), {
      success: true,
      calories: 120,
      protein: 14,
      carbohydrates: 7,
      fats: 4.5,
    });
  });
});
