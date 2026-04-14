import { useEffect, useRef, useState } from "react";
import Loader from "../Loader";
import type { IngredientRow } from "@macro-tracker/macro-tracker-shared";
import { deleteIngredient } from "../../utilities/api";

type IngredientDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  ingredient: IngredientRow | null;
  onDeleted?: (ingredientId: number) => void;
};

export default function IngredientDialog({
  isOpen,
  onClose,
  ingredient,
  onDeleted,
}: IngredientDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    if (isOpen) setDeleteError(null);
  }, [isOpen, ingredient?.id]);

  async function handleDelete(): Promise<void> {
    if (!ingredient) return;
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteIngredient(ingredient.id);
    setIsDeleting(false);
    if (result.ok) {
      onDeleted?.(ingredient.id);
      onClose();
    } else {
      setDeleteError(result.errorMessage);
    }
  }

  const displayDescription =
    ingredient != null &&
    ingredient.description != null &&
    ingredient.description.trim() !== ""
      ? ingredient.description
      : null;

  return (
    <dialog
      className="container-item"
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="container-item-header">Ingredient</div>
      {ingredient == null ? (
        <div className="container-item-body" />
      ) : isDeleting ? (
        <>
          <br />
          <Loader size={1.5} thickness={3} />
        </>
      ) : (
        <div className="container-item-body">
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "4px 8px",
            }}
          >
            {(
              [
                ["Name", ingredient.name],
                ["Description", displayDescription ?? "—"],
                ["Calories", String(ingredient.calories ?? 0)],
                ["Protein", String(ingredient.protein ?? 0)],
                ["Carbohydrates", String(ingredient.carbohydrates ?? 0)],
                ["Fats", String(ingredient.fats ?? 0)],
              ] as const
            ).map(([label, value]) => (
              <li
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "10rem 1fr",
                  gap: "0.5rem",
                  alignItems: "baseline",
                  marginBottom: "0.55rem",
                }}
              >
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
          {deleteError != null ? (
            <p style={{ margin: "8px", color: "var(--bg-error)" }}>{deleteError}</p>
          ) : null}
          <div className="modal-button-container">
            <button type="button" className="button" onClick={onClose}>
              Close
            </button>
            <button type="button" className="button" onClick={() => void handleDelete()}>
              Delete
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
