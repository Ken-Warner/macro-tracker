import { useEffect, useState } from "react";
import Loader from "./Loader";
import CreateIngredientDialog from "./dialogs/CreateIngredientDialog";
import IngredientDialog from "./dialogs/IngredientDialog";
import ToastMessage from "./reusables/ToastMessage";
import type { Toast } from "./reusables/ToastMessage";
import { getIngredients } from "../utilities/api";
import type { IngredientRow } from "@macro-tracker/macro-tracker-shared";

export default function Pantry() {
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] =
    useState<IngredientRow | null>(null);
  const [createIngredientOpen, setCreateIngredientOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const isToastDisplayed = toast != null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      const result = await getIngredients();
      if (cancelled) return;
      if (result.ok) {
        setIngredients(result.body);
      } else {
        setLoadError(result.errorMessage);
        setIngredients([]);
      }
      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleNewIngredient(): void {
    setCreateIngredientOpen(true);
  }

  function handleIngredientClick(ingredient: IngredientRow): void {
    setSelectedIngredient(ingredient);
  }

  const q = searchQuery.trim().toLowerCase();
  const filteredIngredients =
    q === ""
      ? ingredients
      : ingredients.filter((row) => row.name.toLowerCase().includes(q));

  return (
    <>
      {isToastDisplayed ? (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      ) : null}
      <button type="button" className="button" onClick={handleNewIngredient}>
        New Ingredient
      </button>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label htmlFor="pantry-search">Search ingredients</label>
        <input
          id="pantry-search"
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
      ) : ingredients.length === 0 ? (
        <p>Your pantry is empty :(</p>
      ) : filteredIngredients.length === 0 ? (
        <p>No ingredients match your search.</p>
      ) : (
        filteredIngredients.map((row) => (
          <div
            key={row.id}
            className="accordion-item"
            onClick={() => {
              handleIngredientClick(row);
            }}
          >
            <div className="accordion-item-title">{row.name}</div>
            <div className="accordion-item-macro-grid">
              <div className="calories color-calories">{row.calories ?? 0}</div>
              <div className="protein color-protein">{row.protein ?? 0}</div>
              <div className="carbohydrates color-carbohydrates">
                {row.carbohydrates ?? 0}
              </div>
              <div className="fats color-fats">{row.fats ?? 0}</div>
            </div>
          </div>
        ))
      )}
      <CreateIngredientDialog
        isOpen={createIngredientOpen}
        onClose={() => setCreateIngredientOpen(false)}
        onCreated={(row) => {
          setIngredients((prev) => [...prev, row]);
          setToast({
            type: "good",
            message: `Created ingredient "${row.name}".`,
          });
          setCreateIngredientOpen(false);
        }}
        onCreateError={(message) => {
          setToast({ type: "error", message });
        }}
      />
      <IngredientDialog
        isOpen={selectedIngredient !== null}
        onClose={() => setSelectedIngredient(null)}
        ingredient={selectedIngredient}
        onDeleted={(ingredientId) =>
          setIngredients((prev) => prev.filter((row) => row.id !== ingredientId))
        }
      />
    </>
  );
}
