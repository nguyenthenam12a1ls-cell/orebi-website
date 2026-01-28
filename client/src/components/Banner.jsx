import React from "react";
import { Link } from "react-router-dom";
import Container from "./Container";
import { bannerImgOne } from "../assets/images"; 
import { motion } from "framer-motion";

const Banner = () => {
  return (
    <div className="w-full bg-[#F3F4F6] relative overflow-hidden">
      <Container className="relative z-10">
        {/* GIẢM CHIỀU CAO: min-h từ 600px xuống còn 450px */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[400px] lg:min-h-[480px] py-8 lg:py-0">
          
          {/* CỘT 1: TEXT CONTENT */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 order-2 lg:order-1"
          >
            <span className="text-accent font-bold tracking-widest uppercase text-xs bg-white border border-accent/20 px-3 py-1.5 rounded-full shadow-sm">
              New Collection 2025
            </span>
            
            {/* Giảm cỡ chữ tiêu đề xuống một chút cho đỡ choáng */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-titleFont font-extrabold text-primary leading-[1.2]">
              Discover Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-gray-500">
                True Style.
              </span>
            </h1>
            
            <p className="text-secondary text-sm sm:text-base leading-relaxed max-w-[450px]">
              Khám phá bộ sưu tập thời trang và công nghệ mới nhất. Chất lượng đỉnh cao, thiết kế tinh tế dành riêng cho bạn.
            </p>
            
            <div className="flex gap-4 pt-2">
              <Link to="/shop">
                <button className="bg-primary text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-accent hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  Shop Now
                </button>
              </Link>
              <Link to="/about">
                <button className="bg-white text-primary border border-gray-200 px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-gray-50 transition-all duration-300">
                  Explore
                </button>
              </Link>
            </div>
          </motion.div>

          {/* CỘT 2: HÌNH ẢNH HERO */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center relative order-1 lg:order-2"
          >
            {/* Thu nhỏ vòng tròn nền */}
            <div className="absolute w-[280px] h-[280px] lg:w-[400px] lg:h-[400px] bg-white rounded-full blur-[50px] -z-10"></div>
            
            <img 
              src={bannerImgOne} 
              alt="Hero Banner" 
              // Thu nhỏ ảnh lại: max-w từ 480px xuống 380px
              className="w-full max-w-[280px] lg:max-w-[380px] object-contain drop-shadow-2xl animate-float"
            />
          </motion.div>

        </div>
      </Container>
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[10%] right-[0%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[80px]"></div>
      </div>
    </div>
  );
};

export default Banner;