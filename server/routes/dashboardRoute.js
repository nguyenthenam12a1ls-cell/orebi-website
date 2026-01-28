import { Router } from "express";
import {
  getDashboardStats,
  getAnalytics,
  getQuickStats,
} from "../controllers/dashboardController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = Router();

// LƯU Ý: Không cần thêm "/api/dashboard/" ở đây nữa
// Vì server.js đã tự động thêm tiền tố đó rồi.

// URL thực tế: /api/dashboard/stats
router.get("/stats", adminAuth, getDashboardStats);

// URL thực tế: /api/dashboard/analytics
router.get("/analytics", adminAuth, getAnalytics);

// URL thực tế: /api/dashboard/quick-stats
router.get("/quick-stats", adminAuth, getQuickStats);

export default router;