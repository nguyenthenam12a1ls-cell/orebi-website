import express from "express";
import "dotenv/config";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import { readdirSync } from "fs";
import dbConnect from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

const app = express();

// ============================================
// 🔥 FIX 1: Đảm bảo port được load đúng
// ============================================
const port = process.env.PORT || 8000;

// ============================================
// 🔥 FIX 2: Cấu hình CORS đúng
// ============================================
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://10.0.2.2:8081",
  "http://10.0.2.2:8000",
].filter(Boolean);

console.log("✅ Allowed CORS Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("⚠️ Origin blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 🔥 FIX 3: Thêm parsing form data

// ============================================
// 🔥 FIX 4: Kết nối Database trước khi start server
// ============================================
await dbConnect();
await connectCloudinary();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 🔥 FIX 5: Đăng ký routes với error handling
// ============================================
const routesPath = path.resolve(__dirname, "./routes");
const routeFiles = readdirSync(routesPath);

const routeMap = {
  'orderRoute.js': '/api/order',
  'userRoute.js': '/api/user',
  'productRoute.js': '/api/products',
  'brandRoute.js': '/api/brand',
  'categoryRoute.js': '/api/category',
  'checkout.js': '/api/checkout',
  'contactRoute.js': '/api/contact',
  'dashboardRoute.js': '/api/dashboard',
  'paymentRoute.js': '/api/payment',
  'notificationRoute.js': '/api/notifications',
  'chatRoute.js': '/api/chat',
};

const registerRoutes = async () => {
  for (const file of routeFiles) {
    try {
      if (routeMap[file] || file.endsWith('.js')) {
        const routeModule = await import(`./routes/${file}`);
        const prefix = routeMap[file] || '/api';

        app.use(prefix, routeModule.default);
        console.log(`✅ Registered route: ${file} at ${prefix}`);
      }
    } catch (error) {
      console.error(`❌ Failed to load route ${file}:`, error.message);
    }
  }
};

await registerRoutes();

// ============================================
// Health check routes
// ============================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Orebi API Server is running",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 🔥 FIX 6: Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ============================================
// 🔥 FIX 7: Start server với error handling
// ============================================
app.listen(port, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 SERVER STARTED SUCCESSFULLY      ║
╠════════════════════════════════════════╣
║   Port: ${port}                        
║   Environment: ${process.env.NODE_ENV || 'development'}
║   MongoDB: Connected                   
║   Cloudinary: Connected                
╚════════════════════════════════════════╝
  `);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use!`);
    process.exit(1);
  } else {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
});