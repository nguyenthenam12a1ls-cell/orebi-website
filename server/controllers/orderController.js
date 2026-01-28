import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { createNotification } from "./notificationController.js"; // 🔥 1. Import hàm tạo thông báo

// --- 1. TẠO ĐƠN HÀNG (Phiên bản đã FIX lỗi giỏ hàng trống & THÊM THÔNG BÁO) ---
const createOrder = async (req, res) => {
  try {
    const { items, amount, address, paymentMethod = "cod" } = req.body;
    const userId = req.user?.id;

    // Validate dữ liệu đầu vào
    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Order items are required" });
    }
    if (!address) {
      return res.json({ success: false, message: "Delivery address is required" });
    }

    // --- LOGIC TỰ ĐỘNG SỬA DỮ LIỆU ĐỊA CHỈ ---
    let finalFirstName = address.firstName || address.name || "Khách";
    let finalLastName = address.lastName || "";

    // Nếu chỉ có tên gộp, tự động tách ra
    if (!finalLastName && finalFirstName.includes(" ")) {
      const parts = finalFirstName.trim().split(" ");
      if (parts.length > 1) {
        finalLastName = parts.pop();
        finalFirstName = parts.join(" ");
      } else {
        finalLastName = ".";
      }
    }
    if (!finalLastName) finalLastName = ".";

    // Tự điền các trường bắt buộc khác nếu thiếu
    const finalState = address.state || address.province || address.city || "VN";
    const finalZip = address.zipcode || address.zipCode || "70000";
    const finalPhone = address.phone || "0000000000";

    // Tạo object đơn hàng
    const newOrder = new orderModel({
      userId,
      items: items.map((item) => ({
        productId: item._id || item.productId,
        name: item.name || "Sản phẩm",
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.images?.[0] || item.image || "",
      })),
      amount: Number(amount) || 0,
      address: {
        firstName: finalFirstName,
        lastName: finalLastName,
        email: address.email || "no-email@provided.com",
        street: address.street || "Không có địa chỉ",
        city: address.city || "Unknown",
        state: finalState,
        zipcode: finalZip,
        country: address.country || "Vietnam",
        phone: finalPhone,
      },
      paymentMethod,
      status: "pending",
      paymentStatus: "pending",
      date: Date.now(),
    });

    console.log("🔵 [CREATE ORDER] Đang lưu đơn hàng...");

    // 1. Lưu đơn hàng
    const savedOrder = await newOrder.save();
    console.log("✅ [CREATE ORDER] Đơn hàng đã lưu:", savedOrder._id);

    // 2. Cập nhật User (Thêm đơn hàng vào lịch sử)
    const userUpdateQuery = { $push: { orders: savedOrder._id } };

    if (paymentMethod === "cod") {
      // Với COD, xóa giỏ hàng ngay vì không cần thanh toán online
      userUpdateQuery.$set = { userCart: {} };
      console.log("💰 [CREATE ORDER] COD - Xóa giỏ hàng ngay");
    } else {
      // Với Stripe/online payment, giỏ hàng sẽ được xóa sau khi thanh toán thành công
      console.log("💳 [CREATE ORDER] Stripe - Giỏ hàng sẽ được xóa sau khi thanh toán");
    }

    await userModel.findByIdAndUpdate(userId, userUpdateQuery);
    console.log("✅ [CREATE ORDER] Đã cập nhật user");

    // 🔥 3. TẠO THÔNG BÁO TỰ ĐỘNG (CODE MỚI)
    try {
      await createNotification(
        userId,
        "Đặt hàng thành công! 🎉",
        `Đơn hàng #${savedOrder._id.toString().slice(-6).toUpperCase()} trị giá $${amount} đang được xử lý.`,
        "order",
        `/order/${savedOrder._id}`
      );
    } catch (notifError) {
      console.error("⚠️ Lỗi tạo thông báo:", notifError);
      // Không return lỗi ở đây để không chặn quy trình đặt hàng
    }

    // 4. VERIFY đơn hàng đã có trong DB (retry 3 lần)
    let verified = false;
    for (let i = 0; i < 3; i++) {
      const check = await orderModel.findById(savedOrder._id);
      if (check) {
        verified = true;
        console.log(`✅ [CREATE ORDER] Verify thành công (lần ${i + 1})`);
        break;
      }
      console.log(`⚠️ [CREATE ORDER] Đợi đồng bộ... (lần ${i + 1})`);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (!verified) {
      console.error("❌ [CREATE ORDER] Không thể verify đơn hàng sau 3 lần thử");
    }

    res.json({
      success: true,
      message: "Order created successfully",
      orderId: savedOrder._id.toString(),
      order: savedOrder,
      shouldClearCart: paymentMethod !== "cod" // true với Stripe, false với COD
    });

  } catch (error) {
    console.error("❌ [CREATE ORDER ERROR]:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("userId", "name email")
      .populate("items.productId", "name image")
      .sort({ date: -1 });

    res.json({
      success: true,
      orders,
      total: orders.length,
      message: "Orders fetched successfully",
    });
  } catch (error) {
    console.log("Get All Orders Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get orders by user ID
const getUserOrders = async (req, res) => {
  try {
    const requestUserId = req.user?.id;

    if (!requestUserId) {
      return res.json({
        success: false,
        message: "User ID not provided",
      });
    }

    const orders = await orderModel
      .find({ userId: requestUserId })
      .populate("items.productId", "name image price")
      .sort({ date: -1 });

    res.json({
      success: true,
      orders,
      total: orders.length,
      message: "User orders fetched successfully",
    });
  } catch (error) {
    console.log("Get User Orders Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get single order - PHIÊN BẢN CÓ RETRY LOGIC
const getUserOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    console.log("🔍 [GET ORDER] Đang tìm orderId:", orderId, "cho userId:", userId);

    // Validate user
    if (!userId) {
      console.error("❌ [GET ORDER] User chưa đăng nhập");
      return res.json({ success: false, message: "User not authenticated" });
    }

    // Validate orderId format
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("❌ [GET ORDER] OrderId không hợp lệ:", orderId);
      return res.json({ success: false, message: "Invalid Order ID" });
    }

    // 🔥 RETRY LOGIC: Thử tìm 5 lần với delay tăng dần
    let order = null;
    const maxRetries = 5;
    const delays = [0, 500, 1000, 1500, 2000]; // Delay tăng dần

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Đợi trước khi retry (trừ lần đầu)
      if (attempt > 0) {
        console.log(`⏳ [GET ORDER] Retry lần ${attempt + 1}, đợi ${delays[attempt]}ms...`);
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }

      // Tìm order
      order = await orderModel
        .findOne({ _id: orderId, userId })
        .populate("items.productId", "name image price");

      if (order) {
        console.log(`✅ [GET ORDER] Tìm thấy đơn hàng (lần thử ${attempt + 1})`);
        break;
      }

      console.log(`⚠️ [GET ORDER] Chưa tìm thấy (lần thử ${attempt + 1}/${maxRetries})`);
    }

    // Nếu vẫn không tìm thấy sau 5 lần
    if (!order) {
      console.error("❌ [GET ORDER] Không tìm thấy đơn hàng sau", maxRetries, "lần thử");

      // Kiểm tra xem order có tồn tại không (bỏ qua userId)
      const orderExists = await orderModel.findById(orderId);
      if (orderExists) {
        console.error("⚠️ [GET ORDER] Đơn hàng TỒN TẠI nhưng không thuộc về user này!");
        return res.json({
          success: false,
          message: "You don't have permission to view this order",
        });
      }

      return res.json({
        success: false,
        message: "Order not found. Please try again or contact support.",
      });
    }

    res.json({
      success: true,
      order,
      message: "Order fetched successfully",
    });

  } catch (error) {
    console.error("❌ [GET ORDER ERROR]:", error);
    res.json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, paymentStatus } = req.body;

    if (!orderId || !status) {
      return res.json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = Date.now();

    await order.save();

    // 🔥 TẠO THÔNG BÁO KHI TRẠNG THÁI ĐỔI (Code mới thêm)
    try {
      let msg = "";
      if (status === 'confirmed') msg = "Đơn hàng đã được xác nhận và đang đóng gói.";
      if (status === 'shipped') msg = "Đơn hàng đang được giao đến bạn.";
      if (status === 'delivered') msg = "Đơn hàng đã giao thành công. Cảm ơn bạn!";

      if (msg) {
        await createNotification(
          order.userId,
          "Cập nhật đơn hàng",
          `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()}: ${msg}`,
          "order",
          `/order/${order._id}`
        );
      }
    } catch (err) { console.log(err) }

    res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.log("Update Order Status Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Get order statistics (Admin Dashboard)
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const pendingOrders = await orderModel.countDocuments({ status: "pending" });
    const deliveredOrders = await orderModel.countDocuments({ status: "delivered" });

    const revenueResult = await orderModel.aggregate([
      { $match: { status: { $in: ["delivered", "shipped", "confirmed"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const recentOrders = await orderModel
      .find({})
      .populate("userId", "name email")
      .sort({ date: -1 })
      .limit(10);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await orderModel.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue,
        recentOrders,
        monthlyOrders,
      },
      message: "Order statistics fetched successfully",
    });
  } catch (error) {
    console.log("Get Order Stats Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// Delete order (Admin)
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.json({ success: false, message: "Order ID is required" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    await orderModel.findByIdAndDelete(orderId);

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.log("Delete Order Error:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  getUserOrderById,
  updateOrderStatus,
  getOrderStats,
  deleteOrder,
};