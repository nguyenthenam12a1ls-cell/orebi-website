import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ success: false, message: "Không tìm thấy token xác thực" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // QUAN TRỌNG: Mapping đúng key 'id' từ token vào req.user
    // Controller tạo token dùng 'id', nên ở đây cũng phải dùng 'id'
    req.user = { 
        id: payload.id, 
        email: payload.email,
        name: payload.name,
        role: payload.role
    };
    
    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res.status(401).json({ success: false, message: "Phiên đăng nhập hết hạn" });
  }
};

export default userAuth;