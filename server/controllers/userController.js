import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js"; 
import { cloudinary, deleteCloudinaryImage } from "../config/cloudinary.js";
import fs from "fs";
import nodemailer from "nodemailer"; // 🔥 1. Import Nodemailer

// Helper function to clean up temporary files
const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file cleaned up:", filePath);
    }
  } catch (error) {
    console.error("Error cleaning up temporary file:", error);
  }
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Route for user login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    if (!user.isActive) {
      return res.json({ success: false, message: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user);
      // Update last login
      await userModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      
      res.json({
        success: true,
        token,
        user: { 
            name: user.name, 
            email: user.email, 
            role: user.role,
            avatar: user.avatar 
        },
        message: "User logged in successfully",
      });
    } else {
      res.json({ success: false, message: "Invalid credentials, try again" });
    }
  } catch (error) {
    console.log("User Login Error", error);
    res.json({ success: false, message: error.message });
  }
};

// Route for user registration
const userRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "user",
      address,
      isActive = true,
    } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password length should be equal or greater than 8",
      });
    }

    if (role === "admin" && (!req.user || req.user.role !== "admin")) {
      return res.json({
        success: false,
        message: "Only admins can create admin accounts",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: role,
      isActive: isActive,
      address: address || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phone: "",
      },
      userCart: {}
    });

    const user = await newUser.save();

    const token = createToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User registered successfully!",
    });
  } catch (error) {
    console.log("User Register Error", error);
    res.json({ success: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    if (user.role !== "admin") {
      return res.json({ success: false, message: "Admin access required" });
    }

    if (!user.isActive) {
      return res.json({ success: false, message: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      user.lastLogin = new Date();
      await user.save();

      const token = createToken(user);
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Welcome admin",
      });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("Admin Login Error", error);
    res.json({ success: false, message: error.message });
  }
};

const removeUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.body._id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.avatar) {
      try {
        await deleteCloudinaryImage(user.avatar);
      } catch (error) {
        console.log("Error deleting user avatar:", error);
      }
    }

    await user.findByIdAndDelete(req.body._id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log("Removed user Error", error);
    res.json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { _id, name, email, password, role, avatar, addresses, isActive } =
      req.body;

    const user = await userModel.findById(_id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (email) {
      if (!validator.isEmail(email)) {
        return res.json({
          success: false,
          message: "Please enter a valid email address",
        });
      }
      user.email = email;
    }

    if (role) {
      if (role === "admin" && (!req.user || req.user.role !== "admin")) {
        return res.json({
          success: false,
          message: "Only admins can assign admin role",
        });
      }
      user.role = role;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (addresses) {
      user.addresses = addresses;
    }

    if (isActive !== undefined && req.user && req.user.role === "admin") {
      user.isActive = isActive;
    }

    if (password) {
      if (password.length < 8) {
        return res.json({
          success: false,
          message: "Password length should be equal or greater than 8",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.log("Update user Error", error);
    res.json({ success: false, message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (role) {
      filter.role = role;
    }

    const total = await userModel.countDocuments(filter);
    const users = await userModel
      .find(filter)
      .select("-password")
      .populate("orders")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const paramUserId = req.params?.userId;
    const targetUserId = userId || paramUserId;

    const { label, street, city, state, zipCode, country, phone, isDefault } =
      req.body;

    if (!label || !street || !city || !state || !zipCode || !country) {
      return res.json({
        success: false,
        message:
          "All address fields are required (label, street, city, state, zipCode, country)",
      });
    }

    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    const newAddress = {
      label,
      street,
      city,
      state,
      zipCode,
      country,
      phone: phone || "",
      isDefault: isDefault || user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.log("Add Address Error", error);
    res.json({ success: false, message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const paramUserId = req.params?.userId;
    const targetUserId = userId || paramUserId;
    const { addressId } = req.params;
    const { label, street, city, state, zipCode, country, phone, isDefault } =
      req.body;

    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.json({ success: false, message: "Address not found" });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    const updatedAddress = {
      ...user.addresses[addressIndex].toObject(),
      label: label || user.addresses[addressIndex].label,
      street: street || user.addresses[addressIndex].street,
      city: city || user.addresses[addressIndex].city,
      state: state || user.addresses[addressIndex].state,
      zipCode: zipCode || user.addresses[addressIndex].zipCode,
      country: country || user.addresses[addressIndex].country,
      phone: phone !== undefined ? phone : user.addresses[addressIndex].phone,
      isDefault:
        isDefault !== undefined
          ? isDefault
          : user.addresses[addressIndex].isDefault,
    };

    user.addresses[addressIndex] = updatedAddress;
    await user.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.log("Update Address Error", error);
    res.json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const paramUserId = req.params?.userId;
    const targetUserId = userId || paramUserId;
    const { addressId } = req.params;

    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.json({ success: false, message: "Address not found" });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.log("Delete Address Error", error);
    res.json({ success: false, message: error.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const paramUserId = req.params?.userId;
    const targetUserId = userId || paramUserId;
    const { addressId } = req.params;

    const user = await userModel.findById(targetUserId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res.json({ success: false, message: "Address not found" });
    }

    user.addresses.forEach((addr) => (addr.isDefault = false));
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.json({
      success: true,
      message: "Default address updated successfully",
    });
  } catch (error) {
    console.log("Set Default Address Error", error);
    res.json({ success: false, message: error.message });
  }
};

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user?.id;
    const paramUserId = req.params?.userId;
    const targetUserId = userId || paramUserId;

    const user = await userModel.findById(targetUserId).select("addresses");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.log("Get Addresses Error", error);
    res.json({ success: false, message: error.message });
  }
};

const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "orebi/users",
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    cleanupTempFile(req.file.path);

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.log("Avatar upload error", error);
    if (req.file?.path) {
      cleanupTempFile(req.file.path);
    }
    res.json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("-password")
      .populate("orders");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.addresses && user.addresses[0] ? user.addresses[0].phone : "",
      address:
        user.addresses && user.addresses[0] ? user.addresses[0].street : "",
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      orders: user.orders,
      addresses: user.addresses,
    };

    res.json({ success: true, user: userProfile });
  } catch (error) {
    console.log("Get Profile Error", error);
    res.json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { name, email, phone, address, avatar } = req.body;
    
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    
    // Cập nhật avatar nếu có
    if (avatar) user.avatar = avatar;

    if (email && email !== user.email) {
      if (!validator.isEmail(email)) {
        return res.json({
          success: false,
          message: "Please enter a valid email address",
        });
      }

      const existingUser = await userModel.findOne({
        email: email,
        _id: { $ne: userId },
      });
      
      if (existingUser) {
        return res.json({
          success: false,
          message: "Email is already taken by another user",
        });
      }

      user.email = email;
    }

    if (phone || address) {
      if (!user.addresses || user.addresses.length === 0) {
        user.addresses = [
          {
            label: "Primary",
            street: address || "",
            city: "", 
            state: "",
            zipCode: "",
            country: "",
            phone: phone || "",
            isDefault: true,
          },
        ];
      } else {
        if (phone) user.addresses[0].phone = phone;
        if (address) user.addresses[0].street = address;
        
        user.markModified('addresses');
      }
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.addresses && user.addresses.length > 0 ? user.addresses[0].phone : "",
        address: user.addresses && user.addresses.length > 0 ? user.addresses[0].street : "",
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Update Profile Error", error);
    res.json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    let qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) qty = 1;
    if (!user.userCart) {
      user.userCart = {};
    }
    const cartKey = size ? `${productId}_${size}` : productId;
    let currentQty = Number(user.userCart[cartKey]);
    if (isNaN(currentQty)) currentQty = 0;
    user.userCart[cartKey] = currentQty + qty;
    user.markModified("userCart");
    await user.save();
    res.json({
      success: true,
      message: "Item added to cart",
      cart: user.userCart,
    });
  } catch (error) {
    console.log("Add to Cart Error", error);
    res.json({ success: false, message: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.userCart) {
      user.userCart = {};
    }

    const cartKey = size ? `${productId}_${size}` : productId;
    
    let qty = Number(quantity);

    if (qty <= 0 || isNaN(qty)) {
      delete user.userCart[cartKey];
    } else {
      user.userCart[cartKey] = qty;
    }

    user.markModified("userCart");
    await user.save();

    res.json({
      success: true,
      message: "Cart updated successfully",
      cart: user.userCart,
    });
  } catch (error) {
    console.log("Update Cart Error", error);
    res.json({ success: false, message: error.message });
  }
};

// --- HÀM getUserCart MỚI: TỰ ĐỘNG XÓA SẢN PHẨM KHÔNG CÒN TỒN TẠI TRONG DB ---
const getUserCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const cleanCart = {};
    let hasChanges = false;
    const rawCart = user.userCart || {};
    
    // Duyệt qua từng ID sản phẩm trong giỏ hàng
    for (const key of Object.keys(rawCart)) {
        // Tách productId nếu key có dạng id_size (ví dụ: "abc123_L")
        const realProductId = key.split('_')[0];
        const quantity = Number(rawCart[key]);

        // 1. Kiểm tra số lượng hợp lệ
        if (!Number.isInteger(quantity) || quantity <= 0) {
            console.log(`🗑️ Removing bad quantity item: ${key}`);
            hasChanges = true;
            continue; // Bỏ qua item này
        }

        // 2. QUAN TRỌNG: Kiểm tra sản phẩm có tồn tại trong Database không
        // Nếu sản phẩm đã bị xóa khỏi kho (do seed lại), thì phải xóa khỏi giỏ
        try {
            const productExists = await productModel.exists({ _id: realProductId });
            if (productExists) {
                cleanCart[key] = quantity;
            } else {
                console.log(`👻 Removing ghost product (deleted from DB): ${key}`);
                hasChanges = true;
            }
        } catch (err) {
            // Nếu lỗi ID không đúng định dạng MongoDB, cũng coi là rác và xóa
            console.log(`⚠️ Invalid Product ID in cart: ${key}`);
            hasChanges = true;
        }
    }

    // Nếu có sự thay đổi (xóa bớt rác), lưu lại vào DB ngay
    if (hasChanges) {
        user.userCart = cleanCart;
        user.markModified("userCart");
        await user.save();
    }

    res.json({
      success: true,
      cart: cleanCart,
    });
  } catch (error) {
    console.log("Get Cart Error", error);
    res.json({ success: false, message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    user.userCart = {};
    user.markModified("userCart");
    await user.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.log("Clear Cart Error", error);
    res.json({ success: false, message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (req.user.role !== "admin") {
      return res.json({ success: false, message: "Admin access required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password length should be equal or greater than 8",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    const admin = await newAdmin.save();

    res.json({
      success: true,
      message: "Admin created successfully!",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.log("Create Admin Error", error);
    res.json({ success: false, message: error.message });
  }
};

// --- 🔥 GỬI EMAIL QUÊN MẬT KHẨU (FORGOT PASSWORD) ---
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Kiểm tra email có tồn tại không
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Email không tồn tại trong hệ thống" });
    }

    // 2. Tạo token reset (có hiệu lực 15 phút)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 3. Tạo đường dẫn reset
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // 4. Cấu hình gửi mail (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Lấy từ .env
        pass: process.env.EMAIL_PASS, // Lấy từ .env
      },
    });

    // Nội dung email
    const mailOptions = {
      from: '"Orebi Support" <no-reply@orebi.com>',
      to: email,
      subject: "Đặt lại mật khẩu Orebi",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
            <p>Xin chào <strong>${user.name}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng bấm vào nút bên dưới để tạo mật khẩu mới (Link hết hạn sau 15 phút):</p>
            <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Đặt Lại Mật Khẩu</a>
            <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    // Gửi mail
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: "Email hướng dẫn đã được gửi. Vui lòng kiểm tra hộp thư!" 
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Lỗi gửi email. Vui lòng thử lại sau." });
  }
};

// --- 🔥 ĐẶT LẠI MẬT KHẨU (RESET PASSWORD) ---
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.json({ success: false, message: "Thiếu thông tin xác thực" });
    }

    // 1. Giải mã token để lấy ID user
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.json({ success: false, message: "Link đã hết hạn hoặc không hợp lệ" });
    }
    
    // 2. Tìm user
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" });
    }

    // 3. Kiểm tra độ mạnh mật khẩu
    if (newPassword.length < 8) {
        return res.json({ success: false, message: "Mật khẩu phải có ít nhất 8 ký tự" });
    }

    // 4. Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // 5. Lưu vào database
    await user.save();

    res.json({ success: true, message: "Đặt lại mật khẩu thành công! Hãy đăng nhập ngay." });

  } catch (error) {
    console.log("Reset Password Error:", error.message);
    res.json({ success: false, message: "Lỗi hệ thống" });
  }
};

export {
  userLogin,
  userRegister,
  adminLogin,
  getUsers,
  removeUser,
  updateUser,
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
  forgotPassword, // <--- MỚI
  resetPassword,  // <--- MỚI
};