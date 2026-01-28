import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";
import { config } from "../../config";
import { FaLock, FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }
    if (password.length < 8) {
      return toast.error("Mật khẩu phải có ít nhất 8 ký tự");
    }

    setLoading(true);
    try {
      const res = await axios.post(`${config?.baseUrl}/api/user/reset-password`, { 
        token, 
        newPassword: password 
      });

      if (res.data.success) {
        toast.success(res.data.message);
        // Chờ 2 giây rồi chuyển về trang đăng nhập
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Link hết hạn hoặc không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-bodyFont">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <motion.div 
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4"
          >
            <FaCheckCircle className="text-2xl text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-gray-900">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-sm text-gray-500">
            Tạo mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Input Mật khẩu mới */}
            <div className="relative group">
                <FaLock className="absolute top-3.5 left-4 text-gray-400 group-focus-within:text-black transition-colors z-10" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  className="appearance-none rounded-xl relative block w-full px-12 py-3.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm font-medium transition-all"
                  placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-3.5 right-4 text-gray-400 cursor-pointer hover:text-black transition-colors z-10"
                >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                </div>
            </div>

            {/* Input Xác nhận mật khẩu */}
            <div className="relative group">
                <FaLock className="absolute top-3.5 left-4 text-gray-400 group-focus-within:text-black transition-colors z-10" />
                <input
                  type="password"
                  required
                  className="appearance-none rounded-xl relative block w-full px-12 py-3.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm font-medium transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-800 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Đổi mật khẩu ngay"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;