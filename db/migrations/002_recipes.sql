-- Recipes and recipe↔ingredient junction for live batch composition.

CREATE TABLE IF NOT EXISTS recipes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    description text,
    division_mode text NOT NULL,
    portion_count real,
    total_yield_oz real,
    CONSTRAINT recipes_division_mode_check CHECK (
        division_mode IN ('portions', 'per_ounce')
    ),
    CONSTRAINT recipes_portions_require_count CHECK (
        division_mode <> 'portions'
        OR (portion_count IS NOT NULL AND portion_count > 0)
    ),
    CONSTRAINT recipes_per_ounce_require_yield CHECK (
        division_mode <> 'per_ounce'
        OR (total_yield_oz IS NOT NULL AND total_yield_oz > 0)
    )
);

CREATE SEQUENCE IF NOT EXISTS recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE recipes_id_seq OWNED BY recipes.id;

ALTER TABLE ONLY recipes
    ALTER COLUMN id SET DEFAULT nextval('recipes_id_seq'::regclass);

ALTER TABLE ONLY recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY recipes
    ADD CONSTRAINT recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    default_amount real NOT NULL,
    current_amount real NOT NULL,
    CONSTRAINT recipe_ingredients_default_amount_check CHECK (default_amount > 0),
    CONSTRAINT recipe_ingredients_current_amount_check CHECK (current_amount > 0)
);

ALTER TABLE ONLY recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (recipe_id, ingredient_id);

ALTER TABLE ONLY recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_fkey
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;

ALTER TABLE ONLY recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_ingredient_id_fkey
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id);
