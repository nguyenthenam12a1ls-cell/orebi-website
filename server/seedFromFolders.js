import mongoose from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import productModel from "./models/productModel.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// 1. Cấu hình chung
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// ĐƯỜNG DẪN GỐC ĐẾN THƯ MỤC ẢNH
const BASE_IMAGE_DIR = path.join(__dirname, "../client/src/assets/images/products");

// 2. DANH SÁCH SẢN PHẨM VỚI MÔ TẢ CHI TIẾT
const productsToSeed = [
  // --- NHÓM NEW ARRIVALS (Folder: newArrival) ---
  {
    folder: "newArrival",
    file: "newArrOne.webp",
    name: "Minimalist Round Table Clock",
    price: 45.00,
    category: "Home",
    description: "Chiếc đồng hồ để bàn này là sự kết hợp hoàn hảo giữa thiết kế tối giản và công năng hiện đại. Với mặt số rõ ràng, kim chạy êm ái không gây tiếng ồn, sản phẩm phù hợp cho không gian làm việc yên tĩnh hoặc phòng ngủ. Khung viền được làm từ chất liệu nhựa cao cấp giả gỗ, mang lại vẻ đẹp thanh lịch, ấm cúng cho ngôi nhà của bạn.",
    _type: "new_arrivals"
  },
  {
    folder: "newArrival",
    file: "newArrTwo.webp",
    name: "Smart Watch Series 7 Pro",
    price: 250.00,
    category: "Electronics",
    description: "Trải nghiệm công nghệ đỉnh cao ngay trên cổ tay bạn. Smart Watch Series 7 Pro sở hữu màn hình Retina luôn bật, sáng hơn 20% so với thế hệ trước. Tích hợp cảm biến đo nồng độ oxy trong máu, theo dõi giấc ngủ và nhịp tim 24/7. Khả năng chống nước IPX7 giúp bạn thoải mái vận động, bơi lội mà không lo hư hại. Pin trâu sử dụng lên đến 3 ngày chỉ với một lần sạc.",
    _type: "new_arrivals"
  },
  {
    folder: "newArrival",
    file: "newArrThree.webp",
    name: "Premium Fabric Storage Basket",
    price: 80.00,
    category: "Home",
    description: "Giải pháp lưu trữ thông minh và thẩm mỹ cho ngôi nhà của bạn. Giỏ đựng đồ được dệt từ sợi vải cotton tự nhiên, thân thiện với môi trường và an toàn cho trẻ nhỏ. Thiết kế quai xách chắc chắn chịu lực tốt, phù hợp để đựng quần áo, đồ chơi, hoặc chăn màn. Màu sắc trung tính dễ dàng phối hợp với mọi phong cách nội thất từ Scandi đến Modern.",
    _type: "new_arrivals"
  },
  {
    folder: "newArrival",
    file: "newArrFour.webp",
    name: "Funny Plush Toy Collection",
    price: 25.00,
    category: "Toys",
    description: "Món quà tuyệt vời cho các bé yêu! Bộ sưu tập thú nhồi bông được làm từ chất liệu bông PP cao cấp, mềm mại và không rụng lông, đảm bảo an toàn tuyệt đối cho hệ hô hấp của trẻ. Thiết kế ngộ nghĩnh, màu sắc tươi sáng giúp kích thích thị giác và trí tưởng tượng của bé. Kích thước vừa vặn để bé ôm khi ngủ hoặc mang theo khi đi chơi.",
    _type: "new_arrivals"
  },

  // --- NHÓM BEST SELLERS (Folder: bestSeller) ---
  {
    folder: "bestSeller",
    file: "bestSellerOne.webp",
    name: "Ceramic Flower Vase",
    price: 35.00,
    category: "Home",
    description: "Bình hoa gốm sứ nghệ thuật, được chế tác thủ công với những đường vân tinh xảo. Lớp men tráng cao cấp giúp bề mặt sáng bóng, chống bám bụi và dễ dàng vệ sinh. Dáng bình thon gọn, cổ cao, thích hợp cắm các loại hoa thân dài như hoa Ly, hoa Hồng hay Tuy líp. Đây không chỉ là vật dụng cắm hoa mà còn là món đồ decor sang trọng cho phòng khách.",
    _type: "best_sellers"
  },
  {
    folder: "bestSeller",
    file: "bestSellerTwo.webp",
    name: "Travel Backpack Gray Edition",
    price: 180.00,
    category: "Bags",
    description: "Người bạn đồng hành lý tưởng cho những chuyến đi. Balo được may từ vải Oxford 600D chống thấm nước, chống mài mòn cực tốt. Hệ thống đệm lưng thoáng khí giúp giảm áp lực lên vai và cột sống khi mang nặng. Ngăn chính rộng rãi chứa được laptop 15.6 inch, cùng nhiều ngăn phụ thông minh để đựng passport, điện thoại, chai nước. Khóa kéo YKK siêu bền.",
    _type: "best_sellers"
  },
  {
    folder: "bestSeller",
    file: "bestSellerThree.webp",
    name: "Essential Household Kit",
    price: 25.00,
    category: "Home",
    description: "Bộ dụng cụ gia đình thiết yếu, bao gồm các vật dụng cần thiết để giữ cho ngôi nhà của bạn luôn gọn gàng và sạch sẽ. Sản phẩm được làm từ nhựa tái chế bền bỉ, thiết kế công thái học giúp việc cầm nắm dễ dàng. Bộ sản phẩm bao gồm giỏ đựng rác mini, chổi quét bụi đa năng và khay đựng đồ tiện lợi. Màu sắc trang nhã, tinh tế.",
    _type: "best_sellers"
  },
  {
    folder: "bestSeller",
    file: "bestSellerFour.webp",
    name: "Travel Duffel Bag Black",
    price: 220.00,
    category: "Bags",
    description: "Túi du lịch Duffel phong cách thể thao, năng động. Chất liệu da PU cao cấp kết hợp vải canvas tạo nên vẻ ngoài mạnh mẽ và độ bền vượt trội. Khoang chứa đồ cực lớn (40L) đủ cho chuyến du lịch 3-5 ngày. Có ngăn riêng biệt để đựng giày, giúp quần áo luôn sạch sẽ. Quai đeo chéo có thể tháo rời, linh hoạt chuyển đổi cách mang.",
    _type: "best_sellers"
  },

  // --- NHÓM SPECIAL OFFERS & KHÁC ---
  {
    folder: "", 
    file: "backPackBlack.webp",
    name: "Urban Backpack Black",
    price: 75.00,
    category: "Bags",
    description: "Balo Urban thiết kế dành riêng cho cư dân thành thị năng động. Kiểu dáng gọn nhẹ, ôm sát cơ thể. Chất liệu vải Polyester trượt nước giúp bảo vệ đồ dùng bên trong khi gặp mưa bất chợt. Ngăn chống sốc dày dặn bảo vệ laptop an toàn tuyệt đối. Phù hợp cho cả đi học, đi làm văn phòng hay dạo phố cuối tuần.",
    _type: "special_offers",
    offer: true,
    discountedPercentage: 10
  },
  {
    folder: "",
    file: "cap.webp",
    name: "Street Style Cap",
    price: 25.00,
    category: "Accessories",
    description: "Mũ lưỡi trai phong cách Streetwear, điểm nhấn hoàn hảo cho bộ trang phục của bạn. Chất liệu vải Kaki 100% cotton thoáng mát, thấm hút mồ hôi tốt. Form mũ cứng cáp, không bị mất dáng sau khi giặt. Khóa điều chỉnh kích thước phía sau bằng kim loại sang trọng, phù hợp với mọi kích cỡ đầu.",
    _type: "special_offers"
  },
  {
    folder: "",
    file: "headPhone.webp",
    name: "Sony Wireless Headphones",
    price: 150.00,
    category: "Electronics",
    description: "Đắm chìm trong thế giới âm nhạc với tai nghe Sony Wireless. Công nghệ chống ồn chủ động (ANC) loại bỏ mọi tạp âm xung quanh. Màng loa 40mm cho âm bass trầm ấm, âm treble trong trẻo. Kết nối Bluetooth 5.0 ổn định, độ trễ cực thấp. Thời lượng pin ấn tượng lên đến 30 giờ nghe nhạc liên tục.",
    _type: "special_offers",
    offer: true,
    discountedPercentage: 15
  },
  {
    folder: "",
    file: "watch.webp",
    name: "Classic Analog Watch",
    price: 199.00,
    category: "Electronics", // Hoặc Accessories
    description: "Vẻ đẹp cổ điển vượt thời gian. Đồng hồ mặt tròn truyền thống với dây đeo da thật mềm mại, ôm tay. Mặt kính Sapphire chống trầy xước hoàn hảo. Bộ máy Quartz Nhật Bản đảm bảo độ chính xác tuyệt đối. Khả năng chống nước 3ATM giúp bạn yên tâm khi rửa tay hoặc đi mưa nhẹ.",
    _type: "featured"
  },
  {
    folder: "",
    file: "eyeGlass.webp",
    name: "Polarized Sun Glasses",
    price: 45.00,
    category: "Accessories",
    description: "Kính mát phân cực bảo vệ đôi mắt tối đa dưới ánh nắng mặt trời. Tròng kính Polarized chống chói, ngăn chặn 100% tia UVA/UVB có hại. Gọng kính làm từ hợp kim Titan siêu nhẹ, dẻo dai, không gây hằn lên sống mũi khi đeo lâu. Thiết kế Aviator kinh điển phù hợp với cả nam và nữ.",
    _type: "featured"
  }
];

const seedDB = async () => {
  try {
    console.log("⏳ Đang kết nối Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối DB thành công!");

    console.log("🗑️  Xóa dữ liệu cũ để làm sạch...");
    await productModel.deleteMany({});

    console.log("🚀 Bắt đầu upload ảnh lên Cloudinary và lưu vào DB...");

    for (const item of productsToSeed) {
      const imagePath = item.folder 
        ? path.join(BASE_IMAGE_DIR, item.folder, item.file)
        : path.join(BASE_IMAGE_DIR, item.file);

      if (!fs.existsSync(imagePath)) {
        console.error(`⚠️  Không tìm thấy file: ${item.file} -> Bỏ qua.`);
        continue;
      }
      
      try {
        process.stdout.write(`📤 Uploading ${item.file}... `);
        const result = await cloudinary.uploader.upload(imagePath, {
          folder: "orebi/products",
        });
        console.log("Done ✅");

        await productModel.create({
          name: item.name,
          price: item.price,
          description: item.description, // Sử dụng mô tả chi tiết mới
          category: item.category,
          brand: "Orebi",
          stock: 50,
          isAvailable: true,
          offer: item.offer || (item._type === "best_sellers"),
          discountedPercentage: item.discountedPercentage || (item._type === "best_sellers" ? 10 : 0),
          images: [result.secure_url],
          _type: item._type,
          tags: [item.category.toLowerCase(), item._type]
        });
        
      } catch (err) {
        console.error(`\n❌ Lỗi khi xử lý ${item.name}:`, err.message);
      }
    }

    console.log("\n🎉 HOÀN TẤT! Đã upload ảnh và nạp dữ liệu chi tiết thành công.");
    process.exit();
  } catch (error) {
    console.error("\n❌ Lỗi hệ thống:", error);
    process.exit(1);
  }
};

seedDB();