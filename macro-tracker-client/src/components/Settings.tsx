import { useRef, useState, type ChangeEvent } from "react";
import ToastMessage, { type Toast } from "./reusables/ToastMessage";
import { exportPantry, importPantry } from "../utilities/api";
import type { PantryExportV1 } from "@macro-tracker/macro-tracker-shared";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `pantry-${stamp}.json`;
}

export default function Settings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const isToastDisplayed = toast != null;

  async function handleExport() {
    setIsExporting(true);
    try {
      const result = await exportPantry();
      if (!result.ok) {
        setToast({ type: "error", message: result.errorMessage });
        return;
      }
      downloadJson(exportFilename(), result.body);
      setToast({
        type: "good",
        message: `Exported ${String(result.body.ingredients.length)} ingredients and ${String(result.body.recipes.length)} recipes`,
      });
    } catch {
      setToast({ type: "error", message: "Unable to export pantry" });
    } finally {
      setIsExporting(false);
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const confirmed = window.confirm(
      "Replace all of your ingredients and recipes with this file? Meal history is kept, but pantry data will be overwritten.",
    );
    if (!confirmed) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setToast({ type: "error", message: "Selected file is not valid JSON" });
        return;
      }

      const result = await importPantry({
        mode: "replace",
        pantry: parsed as PantryExportV1,
      });

      if (!result.ok) {
        setToast({ type: "error", message: result.errorMessage });
        return;
      }

      setToast({
        type: "good",
        message: `Imported ${String(result.body.ingredients_imported)} ingredients and ${String(result.body.recipes_imported)} recipes`,
      });
    } catch {
      setToast({ type: "error", message: "Unable to import pantry" });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <>
      {isToastDisplayed ? (
        <ToastMessage toast={toast} onFinished={() => setToast(null)} />
      ) : null}

      <section className="settings-section">
        <h3 className="settings-section-title">Pantry backup</h3>
        <p className="settings-section-copy">
          Export ingredients and recipes to a JSON file before a major release,
          then import them after the database is rebuilt.
        </p>
        <div className="modal-button-container--stacked">
          <button
            type="button"
            className="button"
            onClick={() => void handleExport()}
            disabled={isExporting || isImporting}
          >
            {isExporting ? "Exporting…" : "Export pantry"}
          </button>
          <button
            type="button"
            className="button"
            onClick={handleImportClick}
            disabled={isExporting || isImporting}
          >
            {isImporting ? "Importing…" : "Import pantry"}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => void handleFileSelected(event)}
        />
      </section>
    </>
  );
}
