import { Router } from "express";
import type { Request } from "express";
import { z } from "zod";
import { createVenture, getVentures, getVenture, uploadVentureLayout, uploadVenturePhoto, updateRegions } from "../controllers/ventures.controller.js";
import { cacheResponse } from "../middleware/cache.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const router = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const ventureId = req.params.id;
      const dir = path.resolve(process.cwd(), "uploads", "ventures", ventureId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const ext = path.extname(file.originalname) || ".png";
      const safe = `layout-${Date.now()}${ext}`;
      cb(null, safe);
    }
  }),
  fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 20 * 1024 * 1024 }
});

const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination: (req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const ventureId = req.params.id;
      const dir = path.resolve(process.cwd(), "uploads", "ventures", ventureId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const safe = `photo-${Date.now()}${ext}`;
      cb(null, safe);
    }
  }),
  fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

const createVentureSchema = z.object({
  name: z.string().min(1),
  locationName: z.string().trim().min(1),
  plotCount: z.number().int().min(1).max(200),
  plotNumberPrefix: z.string().optional(),
  startingPlotNumber: z.number().int().min(1).optional(),
  defaultArea: z.number().int().min(1),
  defaultPricePerSqYard: z.number().int().min(1)
});

router.post(
  "/ventures",
  requireAuth,
  requireRole("ADMIN"),
  validate({ body: createVentureSchema }),
  asyncHandler(createVenture)
);
router.get("/ventures", requireAuth, cacheResponse(60), asyncHandler(getVentures));
router.get("/ventures/:id", requireAuth, asyncHandler(getVenture));
router.post(
  "/ventures/:id/layout",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("layout"),
  asyncHandler(uploadVentureLayout)
);
router.post(
  "/ventures/:id/photo",
  requireAuth,
  requireRole("ADMIN"),
  uploadPhoto.single("photo"),
  asyncHandler(uploadVenturePhoto)
);
router.put(
  "/ventures/:id/regions",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(updateRegions)
);

export default router;
