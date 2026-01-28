import { useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { motion } from "framer-motion";
import { FaQuoteLeft, FaRocket, FaHandshake, FaLightbulb, FaCheckCircle } from "react-icons/fa";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation nhẹ nhàng
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="w-full bg-white pb-20 font-bodyFont">
      
      {/* 1. HERO SECTION - THUẦN CHỮ & MÀU SẮC */}
      <div className="bg-[#0F172A] text-white py-24 md:py-32 relative overflow-hidden">
        {/* Họa tiết nền bằng CSS (Không cần ảnh) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

        <Container>
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <motion.p 
              initial="hidden" animate="visible" variants={fadeInUp}
              className="text-accent font-bold tracking-[0.2em] uppercase text-sm"
            >
              Về Orebi Store
            </motion.p>
            
            <motion.h1 
              initial="hidden" animate="visible" variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
            >
              Chúng tôi định hình <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Tương lai mua sắm.</span>
            </motion.h1>

            <motion.p 
              initial="hidden" animate="visible" variants={fadeInUp}
              className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto"
            >
              Không chỉ là một cửa hàng, Orebi là nơi giao thoa giữa công nghệ hiện đại và phong cách sống tinh tế.
            </motion.p>
          </div>
        </Container>
      </div>

      {/* 2. STATS - SỬ DỤNG ICON THAY ẢNH */}
      <Container className="-mt-16 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Card 1 */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
             className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
           >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
                 <FaRocket />
              </div>
              <h3 className="text-3xl font-bold text-primary">2025</h3>
              <p className="text-gray-500">Năm thành lập</p>
           </motion.div>

           {/* Card 2 */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
             className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
           >
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-4">
                 <FaHandshake />
              </div>
              <h3 className="text-3xl font-bold text-primary">50k+</h3>
              <p className="text-gray-500">Khách hàng tin dùng</p>
           </motion.div>

           {/* Card 3 */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
             className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
           >
              <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center text-2xl mb-4">
                 <FaLightbulb />
              </div>
              <h3 className="text-3xl font-bold text-primary">100+</h3>
              <p className="text-gray-500">Đối tác thương hiệu</p>
           </motion.div>
        </div>
      </Container>

      {/* 3. STORY SECTION - THAY ẢNH BẰNG "MISSION CARD" */}
      <Container className="mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* CỘT TRÁI: Thay vì ảnh, dùng một khối đồ họa chứa thông điệp */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="w-full h-full min-h-[400px] bg-gradient-to-br from-primary to-black rounded-3xl p-10 flex flex-col justify-center relative shadow-2xl overflow-hidden"
          >
             {/* Họa tiết trang trí */}
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
             
             <FaQuoteLeft className="text-6xl text-white/20 mb-6" />
             <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed mb-6">
                "Sứ mệnh của chúng tôi là xóa bỏ ranh giới giữa công nghệ và phong cách sống, mang đến những sản phẩm tốt nhất cho ngôi nhà của bạn."
             </h3>
             <div className="flex items-center gap-4">
                <div className="w-12 h-1 bg-accent"></div>
                <p className="text-gray-300 font-medium">Orebi Team</p>
             </div>
          </motion.div>

          {/* CỘT PHẢI: Nội dung chữ */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
             className="space-y-6"
          >
             <h2 className="text-3xl md:text-4xl font-bold text-primary">Câu chuyện thương hiệu</h2>
             <p className="text-lg text-secondary leading-relaxed text-justify">
                Được thành lập vào năm 2025, Orebi ra đời không phải để trở thành một cửa hàng bán lẻ thông thường. Chúng tôi là tập hợp của những người đam mê sự hoàn hảo.
             </p>
             <p className="text-lg text-secondary leading-relaxed text-justify">
                Chúng tôi hiểu rằng, mỗi món đồ bạn mua không chỉ là vật dụng, mà là một phần của cuộc sống. Vì vậy, quy trình tuyển chọn của Orebi cực kỳ khắt khe: <strong>Chỉ những sản phẩm thực sự chất lượng và có thiết kế xuất sắc mới được xuất hiện tại đây.</strong>
             </p>
             
             <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Giao hàng toàn cầu", "Bảo hành chính hãng", "Hỗ trợ 24/7", "Đổi trả dễ dàng"].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 text-primary font-medium bg-gray-50 p-3 rounded-lg">
                      <FaCheckCircle className="text-accent flex-shrink-0" /> {item}
                   </div>
                ))}
             </div>
          </motion.div>
        </div>
      </Container>

      {/* 4. CALL TO ACTION - ĐƠN GIẢN & HIỆU QUẢ */}
      <div className="bg-[#F8FAFC] py-20">
         <Container>
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
               className="max-w-3xl mx-auto text-center space-y-8"
            >
               <h2 className="text-3xl md:text-4xl font-bold text-primary">Sẵn sàng trải nghiệm?</h2>
               <p className="text-secondary text-lg">
                  Hãy khám phá bộ sưu tập mới nhất của chúng tôi và tìm kiếm những món đồ ưng ý nhất cho bạn.
               </p>
               <div className="flex justify-center gap-4">
                  <Link to="/shop">
                     <button className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        Mua sắm ngay
                     </button>
                  </Link>
                  <Link to="/contact">
                     <button className="bg-white text-primary border border-gray-200 px-10 py-4 rounded-full font-bold hover:bg-gray-50 transition-all">
                        Liên hệ
                     </button>
                  </Link>
               </div>
            </motion.div>
         </Container>
      </div>

    </div>
  );
};

export default About;