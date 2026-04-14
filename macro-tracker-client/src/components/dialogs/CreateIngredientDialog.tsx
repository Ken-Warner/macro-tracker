import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Loader from "../Loader";
import { createNewIngredient } from "../../utilities/api";
import type { IngredientRow } from "@macro-tracker/macro-tracker-shared";

type CreateIngredientDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ingredient: IngredientRow) => void;
  onCreateError: (message: string) => void;
};

const emptyForm = {
  name: "",
  description: "",
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fats: 0,
};

export default function CreateIngredientDialog({
  isOpen,
  onClose,
  onCreated,
  onCreateError,
}: CreateIngredientDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const modal = dialogRef.current;
    if (!modal) return;

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm);
      setIsLoading(false);
    }
  }, [isOpen]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = event.target;
    if (
      name === "calories" ||
      name === "protein" ||
      name === "carbohydrates" ||
      name === "fats"
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    const trimmedName = formData.name.trim();
    if (trimmedName === "") {
      onCreateError("Name is required.");
      return;
    }
    setIsLoading(true);
    const result = await createNewIngredient({
      ingredient: {
        name: trimmedName,
        description: formData.description.trim() || undefined,
        calories: formData.calories,
        protein: formData.protein,
        carbohydrates: formData.carbohydrates,
        fats: formData.fats,
      },
    });
    setIsLoading(false);

    if (result.ok) {
      onCreated(result.body);
    } else {
      onCreateError(result.errorMessage);
    }
  }

  if (!isOpen) return null;

  return (
    <dialog className="container-item" onClose={onClose} ref={dialogRef}>
      <div className="container-item-header">New Ingredient</div>
      {isLoading ? (
        <>
          <br />
          <Loader size={1.5} thickness={3} />
        </>
      ) : (
        <div className="container-item-body">
          <form className="form" onSubmit={(e) => void handleSubmit(e)}>
            <label htmlFor="create-ingredient-name">Name</label>
            <input
              id="create-ingredient-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
            <label htmlFor="create-ingredient-calories">Calories</label>
            <input
              id="create-ingredient-calories"
              type="number"
              name="calories"
              className="input"
              value={formData.calories}
              onChange={handleChange}
              onFocus={(event) => event.target.select()}
            />
            <label htmlFor="create-ingredient-protein">Protein</label>
            <input
              id="create-ingredient-protein"
              type="number"
              name="protein"
              className="input"
              value={formData.protein}
              onChange={handleChange}
              onFocus={(event) => event.target.select()}
            />
            <label htmlFor="create-ingredient-carbohydrates">
              Carbohydrates
            </label>
            <input
              id="create-ingredient-carbohydrates"
              type="number"
              name="carbohydrates"
              className="input"
              value={formData.carbohydrates}
              onChange={handleChange}
              onFocus={(event) => event.target.select()}
            />
            <label htmlFor="create-ingredient-fats">Fats</label>
            <input
              id="create-ingredient-fats"
              type="number"
              name="fats"
              className="input"
              value={formData.fats}
              onChange={handleChange}
              onFocus={(event) => event.target.select()}
            />
            <label htmlFor="create-ingredient-description">Description</label>
            <textarea
              id="create-ingredient-description"
              name="description"
              className="textarea"
              value={formData.description}
              onChange={handleChange}
            />
            <div className="modal-button-container">
              <button className="button" type="submit">
                Create
              </button>
              <button className="button" type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </dialog>
  );
}
