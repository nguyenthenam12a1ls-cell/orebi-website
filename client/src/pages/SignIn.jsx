import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../../config";
import { useDispatch } from "react-redux";
import { setOrderCount, addUser } from "../redux/orebiSlice";
import { FaEnvelope, FaLock, FaArrowRight, FaGoogle } from "react-icons/fa";
import { logoLight } from "../assets/images";

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 🔥 FIX 1: Track component mount status
  const isMounted = useRef(true);

  useEffect(() => {
    // 🔥 FIX 2: Check token without immediate navigation
    const token = localStorage.getItem("token");
    if (token) {
      // Use setTimeout to avoid race condition
      const timer = setTimeout(() => {
        if (isMounted.current) {
          navigate("/", { replace: true });
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  // 🔥 FIX 3: Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // 🔥 FIX 4: Stop event propagation
    
    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // 🔥 FIX 5: Prevent multiple submissions
    if (loading) return;

    setLoading(true);
    
    try {
      const response = await axios.post(`${serverUrl}/api/user/login`, {
        email,
        password,
      });
      
      // 🔥 FIX 6: Check if component still mounted before updating state
      if (!isMounted.current) return;
      
      if (response.data.success) {
        // 1. Lưu token
        localStorage.setItem("token", response.data.token);
        
        // 2. Lưu User vào Redux
        if (response.data.user) {
          dispatch(addUser(response.data.user));
        }
        
        // 3. Lấy số lượng đơn hàng
        try {
          const orderRes = await axios.get(`${serverUrl}/api/order/my-orders`, {
            headers: { Authorization: `Bearer ${response.data.token}` }
          });
          if (orderRes.data.success && isMounted.current) {
            dispatch(setOrderCount(orderRes.data.orders.length));
          }
        } catch(err) { 
          console.log(err);
        }

        toast.success("Đăng nhập thành công!");
        
        // 🔥 FIX 7: Navigate with replace and delay
        setTimeout(() => {
          if (isMounted.current) {
            navigate("/", { replace: true });
          }
        }, 100);
        
      } else {
        if (isMounted.current) {
          toast.error(response.data.message);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      if (isMounted.current) {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50 overflow-hidden font-bodyFont">
      <div className="w-full h-full flex">
        
        {/* LEFT SIDE: Banner Image & Brand */}
        <div className="hidden lg:flex w-1/2 bg-primary text-white flex-col justify-between p-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
          
          <div className="relative z-10">
            <Link to="/">
              <img src={logoLight} alt="logo" className="w-32 mb-8" />
            </Link>
            <h1 className="text-5xl font-titleFont font-bold leading-tight mb-6">
              Welcome back to <br/> the future of shopping.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Khám phá những xu hướng mới nhất và trải nghiệm mua sắm đẳng cấp cùng Orebi.
            </p>
          </div>

          <div className="relative z-10 text-sm text-gray-500">
            © 2025 Orebi Ecommerce. All rights reserved.
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8"
          >
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-primary">Sign In</h2>
              <p className="mt-2 text-secondary">Chào mừng bạn quay trở lại!</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="name@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-bold text-primary">Password</label>
                  <Link to="/forgot-password" className="text-sm text-accent hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <FaLock className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-accent transition-all shadow-lg hover:shadow-accent/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : <>Sign In <FaArrowRight /></>}
              </button>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or continue with</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <button 
                type="button" 
                className="w-full border border-gray-200 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors font-medium text-primary"
                disabled={loading}
              >
                <FaGoogle className="text-red-500" /> Google
              </button>
            </form>

            <p className="text-center text-secondary">
              Don't have an account? {" "}
              <Link to="/signup" className="text-accent font-bold hover:underline">
                Sign Up for free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;