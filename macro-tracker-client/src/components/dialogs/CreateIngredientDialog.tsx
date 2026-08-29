import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Loader from "../Loader";
import {
  createNewIngredient,
  getIngredientFromImage,
} from "../../utilities/api";
import {
  isAllowedIngredientImageExtension,
  isAllowedIngredientImageMime,
  MAX_INGREDIENT_IMAGE_BYTES,
  type IngredientRow,
} from "@macro-tracker/macro-tracker-shared";

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

const maxImageSizeMb = MAX_INGREDIENT_IMAGE_BYTES / (1024 * 1024);
const unsupportedImageMessage =
  "Please use a JPEG, PNG, or WebP image.";

function validateIngredientImageFile(file: File): string | null {
  if (file.size === 0) {
    return "The selected file is empty.";
  }
  if (file.size > MAX_INGREDIENT_IMAGE_BYTES) {
    return `Image must be ${maxImageSizeMb}MB or smaller.`;
  }

  const lastDot = file.name.lastIndexOf(".");
  const ext = lastDot >= 0 ? file.name.slice(lastDot).toLowerCase() : "";
  const mime = file.type.toLowerCase();

  if (
    ext === ".heic" ||
    ext === ".heif" ||
    mime === "image/heic" ||
    mime === "image/heif"
  ) {
    return "HEIC images are not supported. Please use a JPEG, PNG, or WebP image.";
  }

  if (ext && !isAllowedIngredientImageExtension(ext)) {
    return unsupportedImageMessage;
  }

  if (mime && !isAllowedIngredientImageMime(mime)) {
    return unsupportedImageMessage;
  }

  return null;
}

// Remount the form when the dialog opens so fields start empty. Resetting
// that state in an effect would call setState synchronously and trip the
// react-hooks lint.
export default function CreateIngredientDialog({
  isOpen,
  ...props
}: CreateIngredientDialogProps) {
  if (!isOpen) return null;
  return <CreateIngredientFormDialog {...props} />;
}

function CreateIngredientFormDialog({
  onClose,
  onCreated,
  onCreateError,
}: Omit<CreateIngredientDialogProps, "isOpen">) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const modal = dialogRef.current;
    if (!modal) return;
    modal.showModal();
  }, []);

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

  function onImageClick(): void {
    fileInputRef.current?.click();
  }

  async function handleImageSelected(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const validationError = validateIngredientImageFile(file);
    if (validationError) {
      onCreateError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const result = await getIngredientFromImage(file);
      if (!result.ok) {
        onCreateError(result.errorMessage);
        return;
      }
      if (!result.body.success) {
        onCreateError("Failed to process image.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        calories: result.body.calories,
        protein: result.body.protein,
        carbohydrates: result.body.carbohydrates,
        fats: result.body.fats,
      }));
    } catch {
      onCreateError("Failed to process image.");
    } finally {
      setIsLoading(false);
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
              step="0.1"
              min="0"
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
              step="0.1"
              min="0"
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
              step="0.1"
              min="0"
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
              step="0.1"
              min="0"
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
              <button className="button" type="button" onClick={onImageClick}>
                Get From Image
              </button>
            </div>
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
      <input
        accept="image/*"
        hidden
        onChange={(event) => void handleImageSelected(event)}
        ref={fileInputRef}
        type="file"
      />
    </dialog>
  );
}
