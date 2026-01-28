import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ✅ Lấy __dirname trong ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Hàm tạo thư mục tự động
const ensureTempDir = () => {
  const publicDir = path.join(__dirname, "../public");
  const tempDir = path.join(publicDir, "temp");
  
  // Tạo public nếu chưa có
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log("✅ Created public directory:", publicDir);
  }
  
  // Tạo temp nếu chưa có
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log("✅ Created temp directory:", tempDir);
  }
  
  return tempDir;
};

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const tempDir = ensureTempDir();
      console.log("📂 Saving avatar to:", tempDir);
      cb(null, tempDir);
    } catch (error) {
      console.error("❌ Error creating temp directory:", error);
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = "temp-avatar-" + uniqueSuffix + ext;
    console.log("📝 Generated filename:", filename);
    cb(null, filename);
  },
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFilter,
});

export { avatarUpload };