import express from "express";
import { getUserNotifications, markAllAsRead } from "../controllers/notificationController.js";
import authUser from "../middleware/userAuth.js";

const notificationRouter = express.Router();

// GET /api/notifications - Lấy danh sách thông báo của user
notificationRouter.get("/", authUser, getUserNotifications);

// PUT /api/notifications/read-all - Đánh dấu tất cả đã đọc
notificationRouter.put("/read-all", authUser, markAllAsRead);

export default notificationRouter;