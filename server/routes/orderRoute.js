import express from "express";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
  getUserOrderById
} from "../controllers/orderController.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// ============================================
// 🔥 QUAN TRỌNG: Routes CỤ THỂ phải ĐẶT TRƯỚC routes ĐỘNG
// ============================================

// --- USER ROUTES (Specific routes FIRST) ---
router.post("/create", userAuth, createOrder);
router.get("/my-orders", userAuth, getUserOrders);  // ✅ Đặt TRƯỚC /:orderId

// --- ADMIN ROUTES (Specific routes FIRST) ---
router.get("/all-orders", adminAuth, getAllOrders);  // ✅ Đặt TRƯỚC /:orderId
router.get("/stats", adminAuth, getOrderStats);      // ✅ Đặt TRƯỚC /:orderId
router.put("/update-status", adminAuth, updateOrderStatus);
router.delete("/delete", adminAuth, deleteOrder);

// --- DYNAMIC ROUTE (MUST BE LAST) ---
router.get("/:orderId", userAuth, getUserOrderById);  // ✅ Đặt CUỐI CÙNG

export default router;