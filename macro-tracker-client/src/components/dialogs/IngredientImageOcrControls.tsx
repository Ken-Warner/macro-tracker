import { useRef, type ChangeEvent } from "react";
import { getIngredientFromImage } from "../../utilities/api";
import {
  isAllowedIngredientImageExtension,
  isAllowedIngredientImageMime,
  MAX_INGREDIENT_IMAGE_BYTES,
} from "@macro-tracker/macro-tracker-shared";

type IngredientMacrosFromImage = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
};

type IngredientImageOcrControlsProps = {
  onBusyChange: (busy: boolean) => void;
  onError: (message: string) => void;
  onMacros: (macros: IngredientMacrosFromImage) => void;
};

const maxImageSizeMb = MAX_INGREDIENT_IMAGE_BYTES / (1024 * 1024);
const unsupportedImageMessage = "Please use a JPEG, PNG, or WebP image.";

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

export default function IngredientImageOcrControls({
  onBusyChange,
  onError,
  onMacros,
}: IngredientImageOcrControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onError(validationError);
      return;
    }

    onBusyChange(true);
    try {
      const result = await getIngredientFromImage(file);
      if (!result.ok) {
        onError(result.errorMessage);
        return;
      }
      if (!result.body.success) {
        onError("Failed to process image.");
        return;
      }
      onMacros({
        calories: result.body.calories,
        protein: result.body.protein,
        carbohydrates: result.body.carbohydrates,
        fats: result.body.fats,
      });
    } catch {
      onError("Failed to process image.");
    } finally {
      onBusyChange(false);
    }
  }

  return (
    <>
      <div className="modal-button-container">
        <button className="button" type="button" onClick={onImageClick}>
          Get From Image
        </button>
      </div>
      <input
        accept="image/*"
        hidden
        onChange={(event) => void handleImageSelected(event)}
        ref={fileInputRef}
        type="file"
      />
    </>
  );
}
