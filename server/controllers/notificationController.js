import notificationModel from "../models/notificationModel.js";

// 1. Lấy danh sách thông báo của User
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// 2. Đánh dấu tất cả là đã đọc (Khi bấm vào chuông)
const markAllAsRead = async (req, res) => {
  try {
    await notificationModel.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: "Marked all as read" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 3. Hàm nội bộ: TẠO THÔNG BÁO (Dùng cho các controller khác gọi, không cần export ra route)
const createNotification = async (userId, title, message, type = "system", link = "") => {
  try {
    await notificationModel.create({
      userId,
      title,
      message,
      type,
      link
    });
    console.log(`🔔 Đã tạo thông báo cho User: ${userId}`);
  } catch (error) {
    console.error("Lỗi tạo thông báo:", error);
  }
};

export { getUserNotifications, markAllAsRead, createNotification };