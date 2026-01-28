import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Container from "../components/Container";
import { FaUser, FaBoxOpen, FaHeart, FaSignOutAlt, FaCamera, FaSave, FaPen, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { config } from "../../config";
import toast from "react-hot-toast";
import { addUser, removeUser } from "../redux/orebiSlice";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.orebiReducer.userInfo);
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // State cho Avatar
  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "", // Thêm trường avatar
  });

  // Load dữ liệu
  useEffect(() => {
    if (!userInfo) {
      navigate("/signin");
    } else {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${config?.baseUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data.success) {
            const user = res.data.user;
            const defaultAddr = user.addresses?.[0] || {};
            setFormData({
              name: user.name || "",
              email: user.email || "",
              phone: defaultAddr.phone || "",
              address: defaultAddr.street || "",
              avatar: user.avatar || "",
            });
            // Set ảnh preview ban đầu từ DB
            setPreviewUrl(user.avatar || "");
          }
        } catch (error) {
          console.error("Lỗi tải profile:", error);
        }
      };
      fetchProfile();
    }
  }, [userInfo, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý khi chọn file ảnh
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Giới hạn 5MB
        toast.error("File quá lớn (Max 5MB)");
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Tạo link xem trước
    }
  };

  const handleLogout = () => {
    dispatch(removeUser());
    localStorage.removeItem("token");
    toast.success("Đăng xuất thành công");
    navigate("/signin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      let currentAvatarUrl = formData.avatar;

      // 1. Nếu có chọn file mới -> Upload lên server trước
      if (avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("avatar", avatarFile);

        const uploadRes = await axios.post(
          `${config?.baseUrl}/api/user/upload-avatar`, 
          uploadFormData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data" 
            } 
          }
        );

        if (uploadRes.data.success) {
          currentAvatarUrl = uploadRes.data.avatarUrl;
        } else {
          throw new Error("Lỗi upload ảnh");
        }
      }

      // 2. Cập nhật thông tin profile (bao gồm link ảnh mới)
      const res = await axios.put(
        `${config?.baseUrl}/api/user/profile`,
        {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          avatar: currentAvatarUrl, // Gửi link ảnh mới lên
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        setIsEditing(false);
        dispatch(addUser(res.data.user)); // Cập nhật Redux
        setAvatarFile(null); // Reset file
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: "profile", icon: <FaUser />, label: "Hồ sơ cá nhân" },
    { id: "orders", icon: <FaBoxOpen />, label: "Đơn hàng", link: "/orders" },
    { id: "wishlist", icon: <FaHeart />, label: "Yêu thích", link: "/wishlist" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-bodyFont">
      
      {/* HERO SECTION */}
      <div className="relative bg-[#0F172A] text-white pt-20 pb-32 overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
         
         <Container>
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                  <span>/</span>
                  <span className="text-accent">Account</span>
               </div>
               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Xin chào, {formData.name}</h1>
               <p className="text-gray-400 text-lg">Quản lý thông tin và theo dõi đơn hàng của bạn.</p>
            </div>
         </Container>
      </div>

      {/* MAIN CARD */}
      <Container className="-mt-20 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]"
        >
          
          {/* LEFT SIDEBAR */}
          <div className="lg:w-[280px] bg-gray-50 border-r border-gray-100 flex flex-col">
             {/* Avatar Section */}
             <div className="p-8 border-b border-gray-100 text-center">
                <div 
                  onClick={() => isEditing && fileInputRef.current.click()} 
                  className={`w-24 h-24 mx-auto p-1 rounded-full shadow-md mb-4 relative group overflow-hidden ${isEditing ? 'cursor-pointer hover:ring-2 hover:ring-accent' : ''}`}
                >
                   {/* Hiển thị ảnh hoặc chữ cái đầu */}
                   {previewUrl ? (
                     <img src={previewUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                   ) : (
                     <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-black flex items-center justify-center text-4xl font-bold text-white uppercase">
                        {formData.name.charAt(0)}
                     </div>
                   )}

                   {/* Overlay Camera Icon khi Edit */}
                   {isEditing && (
                     <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-xl" />
                     </div>
                   )}
                   
                   {/* Input File Ẩn */}
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                   />
                </div>
                
                <h3 className="font-bold text-primary text-lg truncate">{formData.name}</h3>
                <p className="text-xs text-secondary mt-1">{formData.email}</p>
                {isEditing && <p className="text-[10px] text-accent mt-2">Bấm vào ảnh để thay đổi</p>}
             </div>

             {/* Menu Links */}
             <div className="flex-1 py-6 px-4 space-y-2">
                {sidebarItems.map((item) => (
                   item.link ? (
                      <Link key={item.id} to={item.link} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-secondary hover:bg-white hover:text-primary hover:shadow-sm transition-all">
                         {item.icon} {item.label}
                      </Link>
                   ) : (
                      <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? "bg-primary text-white shadow-md" : "text-secondary hover:bg-white hover:text-primary hover:shadow-sm"}`}>
                         {item.icon} {item.label}
                      </button>
                   )
                ))}
             </div>

             <div className="p-4 border-t border-gray-100">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                   <FaSignOutAlt /> Đăng xuất
                </button>
             </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 p-8 lg:p-12">
             {activeTab === "profile" && (
                <div className="h-full flex flex-col">
                   <div className="flex justify-between items-center mb-10">
                      <div>
                         <h2 className="text-2xl font-bold text-primary">Thông tin tài khoản</h2>
                         <p className="text-secondary text-sm mt-1">Cập nhật thông tin cá nhân của bạn.</p>
                      </div>
                      {!isEditing && (
                         <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-accent hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-full">
                            <FaPen size={12} /> Chỉnh sửa
                         </button>
                      )}
                   </div>

                   <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Họ và tên</label>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isEditing ? "bg-white border-gray-300 focus-within:border-accent" : "bg-gray-50 border-transparent"}`}>
                               <FaUser className="text-gray-400" />
                               <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className="w-full bg-transparent outline-none text-primary font-medium" />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Số điện thoại</label>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isEditing ? "bg-white border-gray-300 focus-within:border-accent" : "bg-gray-50 border-transparent"}`}>
                               <FaPhoneAlt className="text-gray-400" />
                               <input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} placeholder="Thêm số điện thoại" className="w-full bg-transparent outline-none text-primary font-medium" />
                            </div>
                         </div>

                         <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Email (Đăng nhập)</label>
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent bg-gray-50 opacity-70">
                               <FaEnvelope className="text-gray-400" />
                               <input type="email" value={formData.email} disabled className="w-full bg-transparent outline-none text-gray-500 font-medium cursor-not-allowed" />
                            </div>
                         </div>

                         <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Địa chỉ giao hàng</label>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isEditing ? "bg-white border-gray-300 focus-within:border-accent" : "bg-gray-50 border-transparent"}`}>
                               <FaMapMarkerAlt className="text-gray-400" />
                               <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} placeholder="Thêm địa chỉ giao hàng..." className="w-full bg-transparent outline-none text-primary font-medium" />
                            </div>
                         </div>
                      </div>

                      {isEditing && (
                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 pt-4">
                            <button type="submit" disabled={loading} className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2">
                               {loading ? "Đang lưu..." : <><FaSave /> Lưu thay đổi</>}
                            </button>
                            <button type="button" onClick={() => { setIsEditing(false); setAvatarFile(null); setPreviewUrl(formData.avatar); }} className="bg-white border border-gray-200 text-secondary px-6 py-3 rounded-full font-bold hover:bg-gray-50 transition-all">
                               Hủy bỏ
                            </button>
                         </motion.div>
                      )}
                   </form>
                </div>
             )}
          </div>

        </motion.div>
      </Container>
    </div>
  );
};

export default Profile;