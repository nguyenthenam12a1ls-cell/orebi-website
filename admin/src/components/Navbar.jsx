import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { 
  FaBell, FaCalendarAlt, FaShoppingCart, FaEnvelope, 
  FaInfoCircle, FaCheck, FaTimes 
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng menu thông báo
  const dropdownRef = useRef(null); // Để xử lý click ra ngoài thì đóng menu

  // Lấy ngày hiện tại
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // --- DỮ LIỆU THÔNG BÁO GIẢ LẬP (MOCK DATA) ---
  // Sau này bạn có thể thay thế bằng API lấy từ Database
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      message: "New order #ORD-8829 received ($120.50)",
      time: "2 min ago",
      read: false,
      link: "/orders"
    },
    {
      id: 2,
      type: "message",
      message: "Customer John Doe sent a message",
      time: "1 hour ago",
      read: false,
      link: "/contacts"
    },
    {
      id: 3,
      type: "system",
      message: "System update completed successfully",
      time: "5 hours ago",
      read: true,
      link: "/"
    },
    {
      id: 4,
      type: "order",
      message: "High value order #ORD-9921 needs approval",
      time: "1 day ago",
      read: true,
      link: "/orders"
    }
  ]);

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter(n => !n.read).length;

  // Xử lý khi click ra ngoài thì đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm đánh dấu đã đọc
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Hàm đánh dấu tất cả đã đọc
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Icon cho từng loại thông báo
  const getIcon = (type) => {
    switch(type) {
      case 'order': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><FaShoppingCart size={12} /></div>;
      case 'message': return <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><FaEnvelope size={12} /></div>;
      default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-full"><FaInfoCircle size={12} /></div>;
    }
  };

  return (
    <div className="h-16 fixed top-0 right-0 left-0 sm:left-64 lg:left-72 z-30 px-6 py-2 transition-all duration-300">
      {/* Container hiệu ứng kính mờ */}
      <div className="w-full h-full glass-effect rounded-xl flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border border-white/40 shadow-sm">
        
        {/* LEFT: Tiêu đề & Ngày tháng */}
        <div className="flex flex-col justify-center animate-fade-in">
          <h2 className="text-lg font-bold text-gray-800 leading-tight">
            Dashboard
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium uppercase tracking-wide">
            <FaCalendarAlt className="text-blue-500" />
            <span>{today}</span>
          </div>
        </div>

        {/* RIGHT: Trạng thái & Thông báo */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-xs font-bold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>System Online</span>
          </div>

          {/* --- NOTIFICATION DROPDOWN AREA --- */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all group outline-none"
            >
              <FaBell className={`text-xl transition-transform duration-300 ${isOpen ? 'text-blue-600' : ''} group-hover:rotate-12`} />
              
              {/* Chấm đỏ đếm số lượng */}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* --- DROPDOWN MENU --- */}
            {isOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in origin-top-right z-50">
                {/* Header Dropdown */}
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                      <FaCheck /> Mark all read
                    </button>
                  )}
                </div>

                {/* List Items */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No notifications</div>
                  ) : (
                    notifications.map((item) => (
                      <Link 
                        to={item.link} 
                        key={item.id}
                        onClick={() => { markAsRead(item.id); setIsOpen(false); }}
                        className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 relative ${!item.read ? 'bg-blue-50/30' : ''}`}
                      >
                        {/* Dot xanh nếu chưa đọc */}
                        {!item.read && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        )}

                        <div className="flex-shrink-0 mt-1 ml-2">
                          {getIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!item.read ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                            {item.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                {/* Footer Dropdown */}
                <div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
                  <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-gray-500 hover:text-gray-800 uppercase tracking-wide">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* --- END NOTIFICATION --- */}

          {/* User Avatar (Mobile) */}
          <div className="sm:hidden flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
               {user?.name?.charAt(0).toUpperCase()}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;