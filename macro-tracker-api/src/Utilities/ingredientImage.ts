import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import {
  INGREDIENT_IMAGE_FIELD_NAME,
  MAX_INGREDIENT_IMAGE_BYTES,
  isAllowedIngredientImageMime,
  type AllowedIngredientImageMime,
} from "@macro-tracker/macro-tracker-shared";
import { log, loggingLevels } from "./logger.js";

const maxImageSizeMb = MAX_INGREDIENT_IMAGE_BYTES / (1024 * 1024);
const unsupportedImageMessage = "Please use a JPEG, PNG, or WebP image.";
const uploadDir = path.join(os.tmpdir(), "macro-tracker-uploads");

const mimeToExt: Record<AllowedIngredientImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class IngredientImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IngredientImageValidationError";
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_INGREDIENT_IMAGE_BYTES,
    files: 1,
    fields: 0,
  },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedIngredientImageMime(file.mimetype)) {
      cb(new IngredientImageValidationError(unsupportedImageMessage));
      return;
    }
    cb(null, true);
  },
});

export function parseIngredientImageUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  upload.single(INGREDIENT_IMAGE_FIELD_NAME)(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? `Image must be ${maxImageSizeMb}MB or smaller.`
          : "Invalid image upload.";
      res.status(400).send(JSON.stringify({ error: message }));
      return;
    }
    if (err instanceof IngredientImageValidationError) {
      res.status(400).send(JSON.stringify({ error: err.message }));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

export function sanitizedOriginalName(originalname: string): string {
  return path.basename(originalname.replace(/\0/g, "")).slice(0, 255);
}

export async function validateIngredientImageBuffer(
  buffer: Buffer,
  declaredMime: string,
): Promise<{ mime: AllowedIngredientImageMime; ext: string }> {
  if (buffer.length === 0) {
    throw new IngredientImageValidationError("The selected file is empty.");
  }
  if (buffer.length > MAX_INGREDIENT_IMAGE_BYTES) {
    throw new IngredientImageValidationError(
      `Image must be ${maxImageSizeMb}MB or smaller.`,
    );
  }
  if (!isAllowedIngredientImageMime(declaredMime)) {
    throw new IngredientImageValidationError(unsupportedImageMessage);
  }

  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !isAllowedIngredientImageMime(detected.mime)) {
    throw new IngredientImageValidationError(unsupportedImageMessage);
  }
  if (detected.mime !== declaredMime) {
    throw new IngredientImageValidationError(
      "The file content does not match its type.",
    );
  }

  return { mime: detected.mime, ext: mimeToExt[detected.mime] };
}

export async function writeIngredientImageTemp(
  buffer: Buffer,
  ext: string,
): Promise<string> {
  await mkdir(uploadDir, { recursive: true });
  const tempPath = path.join(uploadDir, `${randomUUID()}.${ext}`);
  await writeFile(tempPath, buffer);
  return tempPath;
}

export async function deleteIngredientImageTemp(
  filePath: string | undefined,
): Promise<void> {
  if (!filePath) {
    return;
  }
  try {
    await unlink(filePath);
  } catch (e) {
    const code =
      e !== null && typeof e === "object" && "code" in e
        ? (e as { code: unknown }).code
        : undefined;
    if (code !== "ENOENT") {
      const message = e instanceof Error ? e.message : String(e);
      log(loggingLevels.ERROR, `deleteIngredientImageTemp: ${message}`, {
        fileName: path.basename(filePath),
      });
    }
  }
}
