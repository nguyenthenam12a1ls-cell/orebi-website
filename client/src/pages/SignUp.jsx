import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../../config";
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import { logoLight } from "../assets/images";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`${serverUrl}/api/user/register`, {
        ...formData,
        role: "user"
      });
      if (res.data.success) {
        toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
        navigate("/signin");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="w-full h-full flex flex-row-reverse">
        
        {/* RIGHT SIDE: Banner Image (Đảo ngược vị trí so với SignIn cho lạ mắt) */}
        <div className="hidden lg:flex w-1/2 bg-primary text-white flex-col justify-between p-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent opacity-20 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10 text-right">
            <Link to="/" className="inline-block">
              <img src={logoLight} alt="logo" className="w-32 mb-8 ml-auto" />
            </Link>
            <h1 className="text-5xl font-titleFont font-bold leading-tight mb-6">
              Join the <br/> community.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md ml-auto">
              Tạo tài khoản ngay để nhận ưu đãi thành viên và theo dõi đơn hàng dễ dàng.
            </p>
          </div>

          <div className="relative z-10 text-sm text-gray-500 text-right">
            © 2025 Orebi Ecommerce.
          </div>
        </div>

        {/* LEFT SIDE: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-primary">Create Account</h2>
              <p className="mt-2 text-secondary">Bắt đầu hành trình mua sắm của bạn.</p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="Create a password"
                  />
                </div>
                <p className="text-xs text-gray-400">Must be at least 8 characters.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-accent transition-all shadow-lg hover:shadow-accent/30 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? "Creating..." : <>Create Account <FaArrowRight /></>}
              </button>
            </form>

            <p className="text-center text-secondary">
              Already have an account? {" "}
              <Link to="/signin" className="text-accent font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;