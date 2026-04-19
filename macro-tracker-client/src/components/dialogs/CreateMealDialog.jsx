import { useRef, useState, useEffect, useCallback } from "react";
import Loader from "../Loader";
import ToastMessage from "../reusables/ToastMessage";
import {
  getIngredients,
  postMealComposed,
  postMealNonComposed,
} from "../../utilities/api";

const PORTION_STEP = 0.25;
const MIN_PORTION = 0.25;

function snapPortion(n) {
  if (!Number.isFinite(n)) return MIN_PORTION;
  const snapped = Math.round(n / PORTION_STEP) * PORTION_STEP;
  return Math.max(MIN_PORTION, snapped);
}

export default function CreateMealDialog({
  isOpen,
  onClose,
  onAddNewMeal,
  mealToCopy,
}) {
  const createMealModal = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(mealToCopy);
  const [activeTab, setActiveTab] = useState("manual");

  const [pantryIngredients, setPantryIngredients] = useState([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [ingredientsError, setIngredientsError] = useState(null);
  const [pantrySearch, setPantrySearch] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState(
    () => new Map(),
  );

  const [toast, setToast] = useState(null);
  const isToastDisplayed = toast != null;

  useEffect(() => {
    const modal = createMealModal.current;
    if (!modal) return;

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T");

    const copiedMealData = {
      ...mealToCopy,
      date: today[0],
      time: today[1].split(".")[0].slice(0, -3),
      id: 0,
    };

    setFormData(copiedMealData);
  }, [mealToCopy]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab("manual");
    setSelectedIngredients(new Map());
    setPantrySearch("");
  }, [isOpen, mealToCopy]);

  useEffect(() => {
    if (!isOpen || activeTab !== "composed") return;

    let cancelled = false;

    async function load() {
      setIngredientsLoading(true);
      setIngredientsError(null);
      const result = await getIngredients();
      if (cancelled) return;
      if (result.ok) {
        setPantryIngredients(result.body);
      } else {
        setIngredientsError(result.errorMessage);
        setPantryIngredients([]);
      }
      setIngredientsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, activeTab]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  const addOrMergeIngredient = useCallback((row) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      const existing = next.get(row.id);
      const portionSize = existing ? existing.portionSize + 1 : 1;
      next.set(row.id, { portionSize: snapPortion(portionSize) });
      return next;
    });
  }, []);

  const adjustPortion = useCallback((id, delta) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      const cur = next.get(id);
      if (!cur) return prev;
      next.set(id, {
        portionSize: snapPortion(cur.portionSize + delta),
      });
      return next;
    });
  }, []);

  const setPortionFromInput = useCallback((id, rawValue) => {
    const n = parseFloat(rawValue);
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      next.set(id, { portionSize: snapPortion(n) });
      return next;
    });
  }, []);

  const removeIngredient = useCallback((id) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    setIsLoading(true);
    try {
      if (activeTab === "manual") {
        const newMeal = await postMealNonComposed(formData);
        onAddNewMeal(newMeal);
        onClose();
      } else {
        const ingredientsPayload = [...selectedIngredients.entries()].map(
          ([ingredientId, { portionSize }]) => ({
            ingredientId,
            portionSize: snapPortion(portionSize),
          }),
        );

        if (ingredientsPayload.length < 1) {
          setToast({
            type: "error",
            message: "You must provide at least one ingredient.",
          });
          return;
        }

        const nameTrimmed = String(formData.name ?? "").trim();
        if (!nameTrimmed) {
          setToast({ type: "error", message: "You must provide a meal name." });
          return;
        }

        const payload = {
          name: nameTrimmed,
          ingredients: ingredientsPayload,
          ...(formData.description
            ? { description: formData.description }
            : {}),
          ...(formData.date ? { date: formData.date } : {}),
          ...(formData.time ? { time: formData.time } : {}),
        };

        const newMeal = await postMealComposed(payload);
        onAddNewMeal(newMeal);
        onClose();
      }
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const q = pantrySearch.trim().toLowerCase();
  const filteredPantry =
    q === ""
      ? pantryIngredients
      : pantryIngredients.filter((row) =>
          row.name.toLowerCase().includes(q),
        );

  function ingredientNameForId(id) {
    const row = pantryIngredients.find((r) => r.id === id);
    return row ? row.name : `Ingredient #${id}`;
  }

  return (
    <>
      {isToastDisplayed && (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      )}
      <dialog
        className="container-item"
        onClose={onClose}
        ref={createMealModal}
      >
        <div className="container-item-header">Add Meal</div>
        {isLoading ? (
          <>
            <br />
            <Loader size={1.5} thickness={3} />
          </>
        ) : (
          <div className="container-item-body">
            <form className="form" onSubmit={handleSubmit}>
              <div
                className="create-meal-tab-row"
                role="tablist"
                aria-label="Meal creation mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "manual"}
                  className={
                    "button" +
                    (activeTab === "manual" ? " button-tab-active" : "")
                  }
                  onClick={() => setActiveTab("manual")}
                >
                  Manual macros
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "composed"}
                  className={
                    "button" +
                    (activeTab === "composed" ? " button-tab-active" : "")
                  }
                  onClick={() => setActiveTab("composed")}
                >
                  From pantry
                </button>
              </div>

              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
              <label htmlFor="date">Date</label>
              <input
                type="date"
                name="date"
                id="date"
                className="input"
                value={formData.date}
                onChange={handleChange}
              />
              <label htmlFor="time">Time</label>
              <input
                type="time"
                name="time"
                id="time"
                className="input"
                step={60}
                value={formData.time}
                onChange={handleChange}
              />

              {activeTab === "manual" ? (
                <>
                  <label htmlFor="calories">Calories</label>
                  <input
                    type="number"
                    name="calories"
                    id="calories"
                    className="input"
                    value={formData.calories}
                    onChange={handleChange}
                    onFocus={(event) => event.target.select()}
                  />
                  <label htmlFor="protein">Protein</label>
                  <input
                    type="number"
                    name="protein"
                    id="protein"
                    className="input"
                    value={formData.protein}
                    onChange={handleChange}
                    onFocus={(event) => event.target.select()}
                  />
                  <label htmlFor="carbohydrates">Carbohydrates</label>
                  <input
                    type="number"
                    name="carbohydrates"
                    id="carbohydrates"
                    className="input"
                    value={formData.carbohydrates}
                    onChange={handleChange}
                    onFocus={(event) => event.target.select()}
                  />
                  <label htmlFor="fats">Fats</label>
                  <input
                    type="number"
                    name="fats"
                    id="fats"
                    className="input"
                    value={formData.fats}
                    onChange={handleChange}
                    onFocus={(event) => event.target.select()}
                  />
                </>
              ) : null}

              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                className="textarea"
                value={formData.description}
                onChange={handleChange}
              />

              {activeTab === "composed" ? (
                <>
                  <label htmlFor="pantry-search-create-meal">
                    Search ingredients
                  </label>
                  <input
                    id="pantry-search-create-meal"
                    className="input"
                    type="search"
                    value={pantrySearch}
                    onChange={(event) => setPantrySearch(event.target.value)}
                    autoComplete="off"
                  />

                  {ingredientsLoading ? (
                    <Loader size={1.25} thickness={3} />
                  ) : ingredientsError ? (
                    <p>{ingredientsError}</p>
                  ) : pantryIngredients.length === 0 ? (
                    <p>Your pantry is empty.</p>
                  ) : filteredPantry.length === 0 ? (
                    <p>No ingredients match your search.</p>
                  ) : (
                    <div
                      className="create-meal-ingredient-scroll"
                      role="listbox"
                      aria-label="Ingredients to add"
                    >
                      {filteredPantry.map((row) => (
                        <div
                          key={row.id}
                          role="option"
                          className="accordion-item"
                          onClick={() => addOrMergeIngredient(row)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              addOrMergeIngredient(row);
                            }
                          }}
                          tabIndex={0}
                        >
                          <div className="accordion-item-title">{row.name}</div>
                          <div className="accordion-item-macro-grid">
                            <div className="calories color-calories">
                              {row.calories ?? 0}
                            </div>
                            <div className="protein color-protein">
                              {row.protein ?? 0}
                            </div>
                            <div className="carbohydrates color-carbohydrates">
                              {row.carbohydrates ?? 0}
                            </div>
                            <div className="fats color-fats">{row.fats ?? 0}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedIngredients.size > 0 ? (
                    <div className="create-meal-selected-heading">
                      In this meal
                    </div>
                  ) : null}

                  {[...selectedIngredients.entries()].map(([id, data]) => (
                    <div key={id} className="create-meal-portion-row">
                      <span
                        className="portion-name"
                        title={ingredientNameForId(id)}
                      >
                        {ingredientNameForId(id)}
                      </span>
                      <div className="create-meal-portion-controls">
                        <button
                          type="button"
                          className="button"
                          aria-label="Decrease portion"
                          onClick={() => adjustPortion(id, -PORTION_STEP)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          className="input create-meal-portion-input"
                          min={MIN_PORTION}
                          step={PORTION_STEP}
                          value={data.portionSize}
                          onChange={(event) =>
                            setPortionFromInput(id, event.target.value)
                          }
                          onFocus={(event) => event.target.select()}
                          aria-label={`Portions for ${ingredientNameForId(id)}`}
                        />
                        <button
                          type="button"
                          className="button"
                          aria-label="Increase portion"
                          onClick={() => adjustPortion(id, PORTION_STEP)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="button"
                          aria-label={`Remove ${ingredientNameForId(id)}`}
                          onClick={() => removeIngredient(id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : null}

              <div className="modal-button-container">
                <button className="button" type="submit">
                  Submit
                </button>
                <button className="button" type="button" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </dialog>
    </>
  );
}
