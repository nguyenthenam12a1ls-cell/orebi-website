import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { config } from "../../config";
import toast from "react-hot-toast";
import { FaEnvelopeOpenText, FaArrowLeft, FaRedo } from "react-icons/fa";

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy email từ trang trước truyền sang
  const email = location.state?.email;

  const [timer, setTimer] = useState(60); // 60 giây đếm ngược
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // Nếu người dùng truy cập trực tiếp link này mà không có email -> đá về trang quên mật khẩu
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Logic đếm ngược
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true); // Hết giờ thì cho phép gửi lại
    }
  }, [timer]);

  // Xử lý Gửi lại Email
  const handleResend = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${config?.baseUrl}/api/user/forgot-password`, { email });
      if (res.data.success) {
        toast.success("Đã gửi lại email mới!");
        setTimer(60); // Reset đồng hồ 60s
        setCanResend(false); // Khóa nút lại
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-bodyFont">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 text-center"
      >
        <motion.div 
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
          className="mx-auto h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6"
        >
          <FaEnvelopeOpenText className="text-4xl text-blue-600" />
        </motion.div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Kiểm tra hộp thư của bạn</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Chúng tôi đã gửi liên kết khôi phục mật khẩu đến:
          <br />
          <span className="font-bold text-primary text-base">{email}</span>
        </p>

        <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-100">
          <p className="text-xs text-gray-500">
            Không thấy email? Hãy kiểm tra thư mục <strong>Spam</strong> hoặc <strong>Quảng cáo</strong>.
          </p>
        </div>

        <div className="space-y-4">
          <a 
            href="https://mail.google.com" 
            target="_blank" 
            rel="noreferrer"
            className="block w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl"
          >
            Mở Gmail Ngay
          </a>

          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${
              canResend 
                ? "bg-white text-primary border-gray-300 hover:bg-gray-50 cursor-pointer" 
                : "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
            }`}
          >
            {loading ? (
               "Đang gửi lại..."
            ) : canResend ? (
               <><FaRedo size={14} /> Gửi lại email</>
            ) : (
               `Gửi lại sau 00:${timer < 10 ? `0${timer}` : timer}`
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button 
            onClick={() => navigate("/signin")} 
            className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors w-full"
          >
            <FaArrowLeft size={12} /> Quay lại đăng nhập
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;