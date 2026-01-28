import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Container from "../components/Container";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { config } from "../../config";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const Contact = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.orebiReducer.userInfo);
  
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setClientName(userInfo.name);
      setEmail(userInfo.email);
    }
    window.scrollTo(0, 0);
  }, [userInfo]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error("Vui lòng đăng nhập để gửi tin nhắn");
      navigate("/signin");
      return;
    }
    if (!clientName || !email || !subject || !message) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${config?.baseUrl}/api/contact`,
        { name: clientName, email, subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Gửi tin nhắn thành công!");
        setSubject("");
        setMessage("");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Contact error:", error);
      toast.error("Gửi tin nhắn thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] pb-20 font-bodyFont">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-[#0F172A] text-white pt-20 pb-32 md:pb-40 overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
         
         <Container>
            <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={fadeInUp} 
                className="relative z-10 text-center space-y-4"
            >
               <div className="flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                  <span>/</span>
                  <span className="text-accent">Contact</span>
               </div>
               
               <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-titleFont">
                 Liên hệ với chúng tôi
               </h1>
               <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                 Bạn có câu hỏi hoặc cần hỗ trợ? Đội ngũ của Orebi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn 24/7.
               </p>
            </motion.div>
         </Container>
      </div>

      {/* 2. MAIN CONTACT CARD */}
      <Container className="-mt-20 relative z-20">
         <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100"
         >
            
            {/* LEFT COLUMN: INFO (DARK THEME) */}
            <div className="lg:w-5/12 bg-primary text-white p-10 md:p-14 relative overflow-hidden flex flex-col justify-between gap-10">
               {/* Decor Circle */}
               <div className="absolute bottom-0 right-0 w-64 h-64 border-[30px] border-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
               
               <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                  <motion.div variants={fadeInUp}>
                     <h3 className="text-2xl font-bold mb-2 font-titleFont">Thông tin liên hệ</h3>
                     <p className="text-gray-400 text-sm">Hãy liên lạc với chúng tôi qua các kênh sau.</p>
                  </motion.div>

                  <div className="space-y-8 relative z-10 mt-10">
                     {/* Address */}
                     <motion.div variants={fadeInUp} className="flex items-start gap-4 group">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-accent text-xl group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-lg">
                           <FaMapMarkerAlt />
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">Địa chỉ</h4>
                           <p className="text-gray-400 text-sm leading-relaxed mt-1">Số 1 Đại Cồ Việt, Hai Bà Trưng,<br/> Hà Nội, Việt Nam</p>
                        </div>
                     </motion.div>

                     {/* Phone */}
                     <motion.div variants={fadeInUp} className="flex items-start gap-4 group">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-accent text-xl group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-lg">
                           <FaPhoneAlt />
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">Điện thoại</h4>
                           <p className="text-gray-400 text-sm mt-1">+84 234 567 890</p>
                           <p className="text-gray-400 text-sm">+84 987 654 321</p>
                        </div>
                     </motion.div>

                     {/* Email */}
                     <motion.div variants={fadeInUp} className="flex items-start gap-4 group">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-accent text-xl group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-lg">
                           <FaEnvelope />
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">Email</h4>
                           <p className="text-gray-400 text-sm mt-1">hotro@orebi.vn</p>
                           <p className="text-gray-400 text-sm">lienhe@orebi.vn</p>
                        </div>
                     </motion.div>
                  </div>
               </motion.div>

               {/* Social Icons */}
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Kết nối với chúng tôi</h4>
                  <div className="flex gap-4">
                     {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, idx) => (
                        <a key={idx} href="#" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:bg-accent hover:border-accent hover:text-white transition-all duration-300 hover:scale-110">
                           <Icon />
                        </a>
                     ))}
                  </div>
               </motion.div>
            </div>

            {/* RIGHT COLUMN: FORM (LIGHT THEME) */}
            <div className="lg:w-7/12 p-10 md:p-14 bg-white relative">
               <h3 className="text-2xl font-bold text-primary mb-6 font-titleFont">Gửi tin nhắn</h3>
               
               {!userInfo ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center h-[400px]"
                  >
                     <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-3xl">🔒</div>
                     <h3 className="text-xl font-bold text-primary">Bạn chưa đăng nhập</h3>
                     <p className="text-secondary font-medium mb-6 mt-2 max-w-xs">Vui lòng đăng nhập để gửi tin nhắn hỗ trợ.</p>
                     <button 
                        onClick={() => navigate("/signin")}
                        className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                     >
                        Đăng nhập ngay
                     </button>
                  </motion.div>
               ) : (
                  <form onSubmit={handlePost} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">Họ tên</label>
                           <input
                              value={clientName}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-primary font-bold focus:outline-none cursor-not-allowed"
                              type="text"
                              disabled
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">Email</label>
                           <input
                              value={email}
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-primary font-bold focus:outline-none cursor-not-allowed"
                              type="email"
                              disabled
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">Tiêu đề <span className="text-red-500">*</span></label>
                        <input
                           onChange={(e) => setSubject(e.target.value)}
                           value={subject}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all font-medium text-primary placeholder-gray-400"
                           type="text"
                           placeholder="Vấn đề cần hỗ trợ..."
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider ml-1">Nội dung <span className="text-red-500">*</span></label>
                        <textarea
                           onChange={(e) => setMessage(e.target.value)}
                           value={message}
                           className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all min-h-[150px] resize-y font-medium text-primary placeholder-gray-400"
                           placeholder="Mô tả chi tiết vấn đề của bạn..."
                        ></textarea>
                     </div>

                     <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.02 }}
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg hover:shadow-accent/30 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                        {loading ? "Đang gửi..." : <>Gửi Tin Nhắn <FaPaperPlane /></>}
                     </motion.button>
                  </form>
               )}
            </div>
         </motion.div>
      </Container>

      {/* 3. MAP SECTION */}
      <Container className="mt-20">
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
         >
            <div className="text-center mb-10">
               <h2 className="text-3xl font-bold text-primary mb-2 font-titleFont">Ghé thăm Showroom</h2>
               <p className="text-secondary">Trải nghiệm sản phẩm trực tiếp tại cửa hàng của chúng tôi.</p>
            </div>
            <div className="w-full h-[450px] bg-gray-200 rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative group">
               {/* Embed Google Map Hà Nội */}
               <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.632906323602!2d105.84117!3d21.00732!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac76ccab6dd7%3A0x55e92a5b07a97d03!2zMSDEkOG6oWkgQ-G7kyBWaeG7h3QsIEzDqiDEkOG6oWkgSMOgbmgsIEhhaSBCw6AgVHLGsG5nLCBIw6AgTuG7mWksIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1708765432100!5m2!1sen!2s" 
                  width="100%" 
                  height="100%" 
                  style={{border:0}} 
                  allowFullScreen="" 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale group-hover:grayscale-0 transition-all duration-700"
               ></iframe>
               {/* Overlay Hint */}
               <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow-lg text-sm font-bold text-primary pointer-events-none flex items-center gap-2 animate-bounce">
                  <FaMapMarkerAlt className="text-red-500" /> Hà Nội, Việt Nam
               </div>
            </div>
         </motion.div>
      </Container>
    </div>
  );
};

export default Contact;