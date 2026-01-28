import { Router } from "express";
import {
  adminLogin,
  getUsers,
  removeUser,
  updateUser,
  userLogin,
  userRegister,
  getUserProfile,
  updateUserProfile,
  addToCart,
  updateCart,
  getUserCart,
  clearCart,
  createAdmin,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserAddresses,
  uploadUserAvatar,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";
import { avatarUpload } from "../middleware/avatarUpload.js";

const router = Router();

// ============================================
// 🔓 Public Routes (Không cần token)
// ============================================
router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/admin", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// ============================================
// 🔐 User Protected Routes (Cần userAuth)
// ============================================
router.get("/profile", userAuth, getUserProfile);
router.put("/profile", userAuth, updateUserProfile);

// Cart Management
router.post("/cart/add", userAuth, addToCart);
router.put("/cart/update", userAuth, updateCart);
router.get("/cart", userAuth, getUserCart);
router.delete("/cart/clear", userAuth, clearCart);

// Address Management (User)
router.get("/addresses", userAuth, getUserAddresses);
router.post("/addresses", userAuth, addAddress);
router.put("/addresses/:addressId", userAuth, updateAddress);
router.delete("/addresses/:addressId", userAuth, deleteAddress);
router.put("/addresses/:addressId/default", userAuth, setDefaultAddress);

// Avatar Upload
router.post("/upload-avatar", userAuth, avatarUpload.single("avatar"), uploadUserAvatar);

// ============================================
// 🛡️ Admin Protected Routes (Cần adminAuth)
// ============================================
router.get("/users", adminAuth, getUsers);
router.post("/create-admin", adminAuth, createAdmin);
router.delete("/remove/:id", adminAuth, removeUser);
router.put("/update/:id", adminAuth, updateUser);

// Address Management (Admin)
router.get("/:userId/addresses", adminAuth, getUserAddresses);
router.post("/:userId/addresses", adminAuth, addAddress);
router.put("/:userId/addresses/:addressId", adminAuth, updateAddress);
router.delete("/:userId/addresses/:addressId", adminAuth, deleteAddress);
router.put("/:userId/addresses/:addressId/default", adminAuth, setDefaultAddress);

export default router;