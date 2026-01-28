import { Router } from "express";
import {
  addProduct,
  listProducts,
  removeProduct,
  singleProducts,
  updateStock,
  updateProduct,
  createProductReview, // <--- 1. Import hàm review mới
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js"; // <--- 2. Import middleware xác thực user

const router = Router();

// ============================================
// PUBLIC ROUTES (Ai cũng xem được)
// ============================================

// Lấy danh sách sản phẩm (có lọc)
router.get("/", (req, res, next) => {
  listProducts(req, res, next);
});

// Lấy chi tiết 1 sản phẩm
router.get("/single", singleProducts);

// ============================================
// USER ROUTES (Phải đăng nhập mới dùng được)
// ============================================

// 🔥 Route đánh giá sản phẩm: /api/products/:id/reviews
router.post("/:id/reviews", userAuth, createProductReview);

// ============================================
// ADMIN ROUTES (Phải là Admin mới dùng được)
// ============================================

router.post(
  "/add",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  adminAuth,
  addProduct
);

router.post("/remove", adminAuth, removeProduct);
router.post("/update-stock", adminAuth, updateStock);

router.put(
  "/:id",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateProduct
);

export default router;