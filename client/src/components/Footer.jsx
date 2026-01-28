import { useState } from "react";
import { motion } from "framer-motion";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPaperPlane } from "react-icons/fa";
import { paymentCard, logoLight } from "../assets/images";
import Container from "./Container";

const Footer = () => {
  const [emailInfo, setEmailInfo] = useState("");
  const [subscription, setSubscription] = useState(false);

  const handleSubscription = () => {
    if (!emailInfo) return;
    setSubscription(true);
    setEmailInfo("");
  };

  return (
    <div className="bg-primary pt-20 pb-10 text-white/80">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Cột 1: Giới thiệu */}
          <div className="space-y-6">
            <img src={logoLight} alt="logo" className="w-28" />
            <p className="text-sm leading-relaxed text-gray-400">
              Orebi là thương hiệu thương mại điện tử hàng đầu, mang đến những sản phẩm chất lượng cao và trải nghiệm mua sắm tuyệt vời nhất cho khách hàng.
            </p>
            <div className="flex gap-4">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-white transition-all duration-300">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Cột 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Cửa Hàng</h3>
            <ul className="space-y-4 text-sm font-medium">
              {["Trang chủ", "Sản phẩm", "Về chúng tôi", "Liên hệ", "Tài khoản"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-accent transition-colors duration-200 block transform hover:translate-x-1">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Hỗ Trợ</h3>
            <ul className="space-y-4 text-sm font-medium">
              {["Chính sách đổi trả", "Câu hỏi thường gặp", "Bảo mật thông tin", "Điều khoản dịch vụ", "Theo dõi đơn hàng"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-accent transition-colors duration-200 block transform hover:translate-x-1">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Newsletter */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Đăng Ký Nhận Tin</h3>
            <p className="text-sm text-gray-400 mb-6">
              Nhận thông báo về các sản phẩm mới và ưu đãi đặc biệt sớm nhất.
            </p>
            
            {subscription ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-accent font-medium"
              >
                Cảm ơn bạn đã đăng ký!
              </motion.div>
            ) : (
              <div className="relative">
                <input
                  value={emailInfo}
                  onChange={(e) => setEmailInfo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-gray-600"
                  placeholder="Email của bạn..."
                  type="email"
                />
                <button 
                  onClick={handleSubscription}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                >
                  <FaPaperPlane size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500">
            © 2025 Orebi Shopping. All rights reserved.
          </p>
          <img src={paymentCard} alt="payment" className="h-6 opacity-70" />
        </div>
      </Container>
    </div>
  );
};

export default Footer;