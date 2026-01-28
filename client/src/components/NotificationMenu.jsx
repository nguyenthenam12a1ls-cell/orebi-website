import { useState, useEffect, useRef } from "react";
import { FaBell, FaCheckCircle, FaShoppingBag, FaInfoCircle, FaExclamationCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { config } from "../../config";
import { Link } from "react-router-dom";

const NotificationMenu = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  // 1. Hàm lấy thông báo từ Server
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("⚠️ Chưa đăng nhập, không fetch notifications");
        return;
      }

      // 🔥 FIX: Đảm bảo URL đúng format
      const apiUrl = `${config?.baseUrl}/api/notifications`;
      console.log("📡 Fetching notifications from:", apiUrl);

      const res = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("✅ Notifications response:", res.data);

      if (res.data.success) {
        setNotifications(res.data.notifications);
        // Đếm số thông báo chưa đọc
        setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error("❌ Lỗi lấy thông báo:", error.message);
      
      // 🔥 Nếu lỗi 404 hoặc API chưa có, không crash app
      if (error.response?.status === 404) {
        console.log("⚠️ API notifications chưa được triển khai trên backend");
      }
      
      // Không set state để tránh re-render liên tục
    }
  };

  // 2. Tự động lấy thông báo mỗi 60 giây (chỉ khi đã login)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("⚠️ Chưa đăng nhập, tắt auto-fetch notifications");
      return;
    }

    // Fetch lần đầu
    fetchNotifications();
    
    // Fetch định kỳ
    const interval = setInterval(fetchNotifications, 60000); 
    
    return () => clearInterval(interval);
  }, []); // Chỉ chạy 1 lần khi mount

  // 3. Xử lý khi bấm vào chuông (Mở menu + Đánh dấu đã đọc)
  const handleToggle = async () => {
    if (!isOpen && unreadCount > 0) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = `${config?.baseUrl}/api/notifications/read-all`;
        
        console.log("📡 Marking all as read:", apiUrl);
        
        await axios.put(apiUrl, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUnreadCount(0); // Xóa số đỏ ngay lập tức
        
        // Cập nhật trạng thái isRead cho tất cả notifications
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        );
      } catch (error) {
        console.error("❌ Lỗi mark as read:", error.message);
      }
    }
    setIsOpen(!isOpen);
  };

  // 4. Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper chọn icon theo loại thông báo
  const getIcon = (type) => {
    switch(type) {
      case 'order': return <FaShoppingBag className="text-blue-500" />;
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'promotion': return <FaExclamationCircle className="text-yellow-500" />;
      default: return <FaInfoCircle className="text-gray-400" />;
    }
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* --- ICON CHUÔNG --- */}
      <button 
        onClick={handleToggle}
        className="relative p-2 text-primary hover:text-accent transition-colors outline-none"
        aria-label="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* --- DROPDOWN MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden origin-top-right"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-primary">Thông báo</h3>
              <button 
                onClick={fetchNotifications} 
                className="text-xs text-accent hover:underline font-medium"
              >
                Làm mới
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm flex flex-col items-center">
                  <FaBell className="text-3xl mb-2 opacity-20" />
                  <p>Chưa có thông báo nào</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <Link 
                    to={item.link || "#"} 
                    key={item._id}
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!item.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 text-lg bg-white p-2 rounded-full shadow-sm border border-gray-100">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm ${!item.isRead ? 'font-bold text-primary' : 'font-medium text-gray-600'}`}>
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-2 block font-medium">
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {!item.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
              <Link 
                to="/orders" 
                onClick={() => setIsOpen(false)} 
                className="text-xs font-bold text-primary hover:text-accent transition-colors"
              >
                Xem lịch sử đơn hàng
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationMenu;