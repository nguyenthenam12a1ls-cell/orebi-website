import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { logo } from "../assets/images"; // Đã sửa đường dẫn logo cho đúng cấu trúc
import Container from "./Container";
import NotificationMenu from "../components/NotificationMenu"; // 🔥 1. Import Component Thông báo

export const headerNavigation = [
  { title: "Home", link: "/" },
  { title: "Shop", link: "/shop" },
  { title: "About", link: "/about" },
  { title: "Contact", link: "/contact" },
];

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const products = useSelector((state) => state.orebiReducer.products);
  const userInfo = useSelector((state) => state.orebiReducer.userInfo);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let amt = 0;
    products.forEach((item) => {
      amt += item.quantity;
    });
    setTotalItems(amt);
  }, [products]);

  // Đóng search khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?_search=${searchQuery}`); // Sửa thành _search để khớp với API
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const activeStyle = "text-primary font-bold border-b-2 border-primary pb-1";
  const normalStyle = "text-secondary hover:text-accent transition-all duration-300 font-medium pb-1 border-b-2 border-transparent hover:border-accent";

  return (
    <div className="w-full h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <Container className="h-full flex items-center justify-between gap-2 relative">
        
        {/* 1. LOGO */}
        <Link to="/">
          <img className="w-28 object-cover" src={logo} alt="logo" />
        </Link>

        {/* 2. MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-10">
          {headerNavigation.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className={`text-sm tracking-wide ${
                location.pathname === item.link ? activeStyle : normalStyle
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* 3. ICONS */}
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Nút Search */}
          <div 
            onClick={() => setShowSearch(!showSearch)}
            className="text-xl text-primary hover:text-accent cursor-pointer transition-colors"
          >
            {showSearch ? <FaTimes /> : <FaSearch />}
          </div>

          {/* 🔥 2. NÚT THÔNG BÁO (Chỉ hiện khi đã đăng nhập) */}
          {userInfo && <NotificationMenu />}

          {/* Nút User */}
          <Link to={userInfo ? "/profile" : "/signin"}>
            <FaUser className="text-xl text-primary hover:text-accent cursor-pointer transition-colors" />
          </Link>

          {/* Nút Cart */}
          <Link to="/cart" className="relative">
            <FaShoppingCart className="text-xl text-primary hover:text-accent cursor-pointer transition-colors" />
            {products.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                {totalItems || 0}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <div 
            onClick={() => setShowMenu(!showMenu)}
            className="text-xl md:hidden text-primary cursor-pointer hover:text-accent"
          >
            {showMenu ? <FaTimes /> : <FaBars />}
          </div>
        </div>

        {/* 4. SEARCH BAR (ĐƠN GIẢN - THẢ XUỐNG) */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              ref={searchRef}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 right-0 w-full md:w-[350px] bg-white border border-gray-200 shadow-xl rounded-b-xl p-4 z-50"
            >
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  className="w-full h-10 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent text-primary"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button 
                  type="submit"
                  className="bg-primary text-white h-10 px-4 rounded-lg font-bold text-sm hover:bg-accent transition-colors"
                >
                  Tìm
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. MOBILE MENU */}
        {showMenu && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed top-20 right-0 w-full sm:w-[300px] h-[calc(100vh-80px)] bg-white border-l border-gray-100 shadow-2xl md:hidden p-6 z-40 overflow-y-auto"
          >
            <ul className="flex flex-col gap-6">
              {headerNavigation.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.link}
                    onClick={() => setShowMenu(false)}
                    className="text-lg font-medium text-primary hover:text-accent block py-2 border-b border-gray-50"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-100">
                 {userInfo ? (
                    <Link to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-3 text-accent font-bold bg-accent/5 p-3 rounded-lg">
                       <FaUser /> {userInfo.name}
                    </Link>
                 ) : (
                    <div className="flex flex-col gap-3">
                       <Link to="/signin" onClick={() => setShowMenu(false)} className="w-full text-center border border-primary text-primary py-2 rounded-lg font-bold">Sign In</Link>
                       <Link to="/signup" onClick={() => setShowMenu(false)} className="w-full text-center bg-primary text-white py-2 rounded-lg font-bold">Sign Up</Link>
                    </div>
                 )}
              </div>
            </ul>
          </motion.div>
        )}
      </Container>
    </div>
  );
};

export default Header;