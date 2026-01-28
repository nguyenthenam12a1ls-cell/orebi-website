import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["order", "system", "promotion", "success", "error"], 
      default: "system" 
    },
    isRead: { type: Boolean, default: false }, // Đã đọc hay chưa
    link: { type: String, default: "" }, // Link để khi bấm vào sẽ chuyển hướng
  },
  { timestamps: true }
);

const notificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);

export default notificationModel;