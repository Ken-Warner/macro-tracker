import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
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
  type GetIngredientFromImageResponse,
} from "@macro-tracker/macro-tracker-shared";
import { createWorker } from "tesseract.js";
import { createCanvas, loadImage } from "canvas";
import cvModule from "@techstark/opencv-js";
import { patternMatchText } from "./nutritionLabelMatch.js";

type OpenCv = Awaited<typeof cvModule>;
type OpenCvMat = { delete(): void };

const maxImageSizeMb = MAX_INGREDIENT_IMAGE_BYTES / (1024 * 1024);
const unsupportedImageMessage = "Please use a JPEG, PNG, or WebP image.";
const uploadDir = path.join(os.tmpdir(), "macro-tracker-uploads");
const maxPreprocessEdgePx = 2000;

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

export async function processIngredientImageWithTesseract(
  buffer: Buffer,
): Promise<GetIngredientFromImageResponse> {
  const processedBuffer = await preprocessIngredientImage(buffer);

  // Leave these here for testing purposes.
  // const tempPath = await writeIngredientImageTemp(processedBuffer, "png");
  // console.log(`Wrote temp image to ${tempPath}`);

  const worker = await createWorker("eng");
  try {
    await worker.setParameters({
      tessedit_char_whitelist:
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%< .,/:/-",
    });

    const result = await worker.recognize(processedBuffer);

    // console.log(result);

    return patternMatchText(result.data.text);
  } finally {
    await worker.terminate();
  }
}

async function preprocessIngredientImage(buffer: Buffer): Promise<Buffer> {
  const [img, cv] = await Promise.all([loadImage(buffer), getOpenCv()]);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const mats: OpenCvMat[] = [];

  try {
    const src = cv.matFromImageData(imgData);
    mats.push(src);

    // Greyscale
    const greyed = new cv.Mat();
    mats.push(greyed);
    cv.cvtColor(src, greyed, cv.COLOR_RGBA2GRAY, 0);

    // Rescale / Upsample 2x, capped so large photos stay manageable
    const resized = new cv.Mat();
    mats.push(resized);
    const longestEdge = Math.max(greyed.cols, greyed.rows);
    const targetLongest = Math.min(longestEdge * 2, maxPreprocessEdgePx);
    const scale = targetLongest / longestEdge;
    if (scale === 1) {
      greyed.copyTo(resized);
    } else {
      const dsize = new cv.Size(
        Math.round(greyed.cols * scale),
        Math.round(greyed.rows * scale),
      );
      cv.resize(greyed, resized, dsize, 0, 0, cv.INTER_CUBIC);
    }

    // Bilateral Filter
    const filtered = new cv.Mat();
    mats.push(filtered);
    cv.bilateralFilter(resized, filtered, 9, 75, 75, cv.BORDER_CONSTANT);

    // Adaptive Threshold
    const binary = new cv.Mat();
    mats.push(binary);
    cv.adaptiveThreshold(
      filtered,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      15,
      2,
    );

    // Convert single-channel binary to RGBA for canvas / PNG output
    const rgba = new cv.Mat();
    mats.push(rgba);
    cv.cvtColor(binary, rgba, cv.COLOR_GRAY2RGBA);

    const outCanvas = createCanvas(binary.cols, binary.rows);
    const outCtx = outCanvas.getContext("2d");
    const outImgData = outCtx.createImageData(binary.cols, binary.rows);
    outImgData.data.set(rgba.data);
    outCtx.putImageData(outImgData, 0, 0);

    return outCanvas.toBuffer("image/png");
  } finally {
    for (const mat of mats) {
      mat.delete();
    }
  }
}

let cvReady: Promise<OpenCv> | undefined;

function getOpenCv(): Promise<OpenCv> {
  cvReady ??= initOpenCv();
  return cvReady;
}

async function initOpenCv(): Promise<OpenCv> {
  if (cvModule instanceof Promise) {
    return await cvModule;
  }
  if (cvModule.Mat) {
    return cvModule;
  }
  await new Promise<void>((resolve) => {
    cvModule.onRuntimeInitialized = () => resolve();
  });
  return cvModule;
}
