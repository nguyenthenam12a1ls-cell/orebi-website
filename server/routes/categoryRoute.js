import express from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const categoryRouter = express.Router();

// ============================================
// 🔥 FIX: BỎ PREFIX "/api/category" VÌ server.js ĐÃ MOUNT VÀO /api/category
// Kết quả: /api/category + / = /api/category ✅
// ============================================

// Public routes
categoryRouter.get("/", getCategories);
categoryRouter.get("/:id", getCategory);

// Admin only routes
categoryRouter.post(
  "/",
  adminAuth,
  upload.single("image"),
  createCategory
);
categoryRouter.put(
  "/:id",
  adminAuth,
  upload.single("image"),
  updateCategory
);
categoryRouter.delete("/:id", adminAuth, deleteCategory);

export default categoryRouter;