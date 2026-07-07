-- Fractional ingredient macros and removal of unused junction tables.

ALTER TABLE ingredients
  ALTER COLUMN calories TYPE real USING calories::real,
  ALTER COLUMN protein TYPE real USING protein::real,
  ALTER COLUMN carbohydrates TYPE real USING carbohydrates::real,
  ALTER COLUMN fats TYPE real USING fats::real;

DROP TABLE IF EXISTS meal_ingredients;
DROP TABLE IF EXISTS recipes;

DROP SEQUENCE IF EXISTS meal_ingredients_meal_id_seq;
DROP SEQUENCE IF EXISTS meal_ingredients_ingredient_id_seq;
DROP SEQUENCE IF EXISTS recipes_parent_ingredient_id_seq;
DROP SEQUENCE IF EXISTS recipes_component_ingredient_id_seq;
