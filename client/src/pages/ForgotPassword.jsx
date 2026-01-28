import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";
import { config } from "../../config";
import { FaEnvelope, FaArrowLeft, FaKey } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook chuyển trang

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Vui lòng nhập Email");

    setLoading(true);
    try {
      const res = await axios.post(`${config?.baseUrl}/api/user/forgot-password`, { email });
      if (res.data.success) {
        toast.success("Đã gửi link xác nhận!");
        // 🔥 CHUYỂN HƯỚNG SANG TRANG XÁC THỰC VÀ GỬI KÈM EMAIL
        navigate("/email-verification", { state: { email: email } });
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối Server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-bodyFont">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4"
          >
            <FaKey className="text-2xl text-blue-600" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900">Quên mật khẩu?</h2>
          <p className="mt-2 text-sm text-gray-500">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
                <FaEnvelope className="absolute top-3.5 left-4 text-gray-400 z-10" />
                <input
                  type="email"
                  required
                  className="appearance-none rounded-xl relative block w-full px-12 py-3.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm font-medium"
                  placeholder="Nhập địa chỉ Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang gửi...
                </span>
            ) : "Gửi link khôi phục"}
          </motion.button>

          <div className="flex justify-center mt-6">
            <Link to="/signin" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-primary transition-colors">
              <FaArrowLeft size={12} /> Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;