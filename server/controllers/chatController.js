import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/productModel.js"; 
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI("AIzaSyACe3GTr4ReOoPGFdf0WlSxkSRAoya19Z0");

export const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // =========================================================
    // 🚀 BƯỚC 1: KIỂM TRA DỮ LIỆU (DEBUG)
    // =========================================================
    // Lấy thử 1 sản phẩm để xem tên trường chính xác là gì
    const checkProduct = await Product.findOne({});
    console.log("🔍 Dữ liệu gốc từ DB (Check tên trường):", checkProduct); 
    // ^^^ Bạn nhớ nhìn Terminal xem nó in ra "productName" hay "name" hay "title" nhé!

    // Lấy toàn bộ sản phẩm
    const products = await Product.find({});
    
    // =========================================================
    // 🚀 BƯỚC 2: TẠO CONTEXT (SỬA LỖI UNDEFINED)
    // =========================================================
    // Tôi đã thêm logic: Nếu productName không có thì thử tìm field 'name' hoặc 'title'
    const productListText = products.map(p => {
      // Tự động tìm tên đúng (phòng trường hợp bạn đặt tên khác trong DB)
      const realName = p.productName || p.name || p.title || "Sản phẩm ẩn";
      const realColor = p.color || "Đa sắc";
      return `- Tên: "${realName}", Giá: $${p.price}, Màu: ${realColor}, Hãng: ${p.brand}, Loại: ${p.category}`;
    }).join("\n");

    const systemInstructionText = `
      Bạn là nhân viên tư vấn bán hàng của shop Orebi.
      NHIỆM VỤ: Trả lời câu hỏi của khách hàng dựa trên danh sách sản phẩm dưới đây.
      
      DANH SÁCH SẢN PHẨM HIỆN CÓ:
      ---
      ${productListText}
      ---

      QUY TẮC:
      1. Chỉ tư vấn sản phẩm có trong danh sách trên.
      2. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.
      3. Nếu khách hỏi giá, hãy đưa ra giá chính xác.
    `;

    // =========================================================
    // 🚀 BƯỚC 3: CẤU HÌNH MODEL (SỬA LỖI 400 BAD REQUEST)
    // =========================================================
    // FIX QUAN TRỌNG: Đưa systemInstruction vào trong getGenerativeModel
    // và định dạng nó thành Object { parts: [...] } để API không báo lỗi.
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: {
        parts: [{ text: systemInstructionText }],
        role: "model"
      }
    });

    // Xử lý lịch sử chat
    let cleanHistory = history || [];
    if (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
      cleanHistory = cleanHistory.slice(1);
    }

    const chat = model.startChat({
      history: cleanHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ success: true, reply: text });

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ success: false, message: "Lỗi kết nối AI" });
  }
};