import { useEffect, useState } from "react";
import Loader from "./Loader";
import CreateRecipeDialog from "./dialogs/CreateRecipeDialog";
import RecipeDialog from "./dialogs/RecipeDialog";
import ToastMessage from "./reusables/ToastMessage";
import type { Toast } from "./reusables/ToastMessage";
import { getRecipes } from "../utilities/api";
import { formatMacro } from "../utilities/formatMacro";
import type { RecipeRow } from "@macro-tracker/macro-tracker-shared";

export default function Recipes() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeRow | null>(null);
  const [createRecipeOpen, setCreateRecipeOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const isToastDisplayed = toast != null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      const result = await getRecipes();
      if (cancelled) return;
      if (result.ok) {
        setRecipes(result.body);
      } else {
        setLoadError(result.errorMessage);
        setRecipes([]);
      }
      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filteredRecipes =
    q === ""
      ? recipes
      : recipes.filter((row) => row.name.toLowerCase().includes(q));

  function unitLabel(recipe: RecipeRow): string {
    return recipe.division_mode === "portions" ? "per portion" : "per oz";
  }

  return (
    <>
      {isToastDisplayed ? (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      ) : null}
      <button
        type="button"
        className="button"
        onClick={() => setCreateRecipeOpen(true)}
      >
        New Recipe
      </button>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label htmlFor="recipes-search">Search recipes</label>
        <input
          id="recipes-search"
          className="input"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          autoComplete="off"
        />
      </form>

      {isLoading ? (
        <Loader size={1.5} thickness={3} />
      ) : loadError ? (
        <p>{loadError}</p>
      ) : recipes.length === 0 ? (
        <p>You have no recipes yet.</p>
      ) : filteredRecipes.length === 0 ? (
        <p>No recipes match your search.</p>
      ) : (
        <div className="pantry-ingredient-scroll">
          {filteredRecipes.map((row) => (
            <div
              key={row.id}
              className="accordion-item"
              onClick={() => setSelectedRecipe(row)}
            >
              <div className="accordion-item-title">
                {row.name}
                <span className="recipe-unit-label"> ({unitLabel(row)})</span>
              </div>
              <div className="accordion-item-macro-grid">
                <div className="calories color-calories">
                  {formatMacro(row.macros_per_unit.calories)}
                </div>
                <div className="protein color-protein">
                  {formatMacro(row.macros_per_unit.protein)}
                </div>
                <div className="carbohydrates color-carbohydrates">
                  {formatMacro(row.macros_per_unit.carbohydrates)}
                </div>
                <div className="fats color-fats">
                  {formatMacro(row.macros_per_unit.fats)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <CreateRecipeDialog
        key={createRecipeOpen ? "open" : "closed"}
        isOpen={createRecipeOpen}
        onClose={() => setCreateRecipeOpen(false)}
        onCreated={(row) => {
          setRecipes((prev) =>
            [...prev, row].sort((a, b) => a.name.localeCompare(b.name)),
          );
          setToast({
            type: "good",
            message: `Created recipe "${row.name}".`,
          });
          setCreateRecipeOpen(false);
        }}
        onCreateError={(message) => {
          setToast({ type: "error", message });
        }}
      />
      <RecipeDialog
        key={selectedRecipe?.id ?? "closed"}
        isOpen={selectedRecipe !== null}
        onClose={() => setSelectedRecipe(null)}
        recipe={selectedRecipe}
        onUpdated={(updated) => {
          setRecipes((prev) =>
            prev.map((row) => (row.id === updated.id ? updated : row)),
          );
          setSelectedRecipe(updated);
        }}
        onDeleted={(recipeId) => {
          setRecipes((prev) => prev.filter((row) => row.id !== recipeId));
          setSelectedRecipe(null);
        }}
      />
    </>
  );
}
