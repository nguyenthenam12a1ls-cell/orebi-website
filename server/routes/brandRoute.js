import express from "express";
import {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const brandRouter = express.Router();

// ============================================
// 🔥 FIX: BỎ PREFIX "/api/brand" VÌ server.js ĐÃ MOUNT VÀO /api/brand
// Kết quả: /api/brand + / = /api/brand ✅
// ============================================

// Public routes
brandRouter.get("/", getBrands);
brandRouter.get("/:id", getBrand);

// Admin only routes
brandRouter.post(
  "/",
  adminAuth,
  upload.single("image"),
  createBrand
);
brandRouter.put(
  "/:id",
  adminAuth,
  upload.single("image"),
  updateBrand
);
brandRouter.delete("/:id", adminAuth, deleteBrand);

export default brandRouter;