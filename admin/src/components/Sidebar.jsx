import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "../redux/authSlice";
import {
  FaList, FaUsers, FaBox, FaChevronDown, FaChevronRight,
  FaFileInvoice, FaSignOutAlt, FaTags, FaBook, FaEnvelope,
  FaCog, FaShoppingBag, FaRocket, FaLayerGroup
} from "react-icons/fa";
import { MdDashboard, MdInventory, MdAnalytics } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [expandedCategories, setExpandedCategories] = useState({
    Products: true,
  });

  const toggleCategory = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
        dispatch(logout());
        toast.success("See you later!");
        navigate("/login");
    }
  };

  const sidebarItems = [
    {
      title: "OVERVIEW",
      items: [
        { label: "Dashboard", path: "/", icon: MdDashboard },
        { label: "Analytics", path: "/analytics", icon: MdAnalytics },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          label: "Products",
          icon: FaBox,
          isCollapsible: true,
          subItems: [
            { label: "All Products", path: "/list", icon: FaList },
            { label: "Add Product", path: "/add", icon: IoMdAddCircle },
            { label: "Inventory", path: "/inventory", icon: MdInventory },
          ],
        },
        { label: "Orders", path: "/orders", icon: FaShoppingBag },
        { label: "Customers", path: "/users", icon: FaUsers },
        { label: "Invoices", path: "/invoice", icon: FaFileInvoice },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Categories", path: "/categories", icon: FaLayerGroup },
        { label: "Brands", path: "/brands", icon: FaTags },
        { label: "Messages", path: "/contacts", icon: FaEnvelope },
        { label: "Settings", path: "/settings", icon: FaCog },
        { label: "API Docs", path: "/api-docs", icon: FaBook },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col sidebar-glass text-gray-300 transition-all duration-300 relative overflow-hidden">
      {/* Background decoration (Hiệu ứng nền mờ ảo) */}
      <div className="absolute top-[-10%] right-[-50%] w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>

      {/* 1. LOGO AREA */}
      <div className="h-20 flex items-center px-6 border-b border-gray-800/50 backdrop-blur-md z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30 group cursor-pointer">
          <FaRocket className="text-white text-lg group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">
            OREBI
          </h1>
          <span className="text-[10px] text-blue-400 font-medium tracking-widest uppercase">Admin Panel</span>
        </div>
      </div>

      {/* 2. MENU ITEMS */}
      <div className="flex-1 overflow-y-auto py-6 px-3 dark-scrollbar space-y-6 z-10">
        {sidebarItems.map((section, index) => (
          <div key={index} className="animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
            <h3 className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  {item.isCollapsible ? (
                    // --- COLLAPSIBLE MENU (Có menu con) ---
                    <>
                      <button
                        onClick={() => toggleCategory(item.label)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden
                          ${expandedCategories[item.label] 
                            ? 'text-white bg-white/5' 
                            : 'hover:bg-white/5 hover:text-white'}`}
                      >
                         {/* Active Indicator Line */}
                         {expandedCategories[item.label] && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>}

                        <div className="flex items-center gap-3">
                          <item.icon className={`text-lg transition-colors ${expandedCategories[item.label] ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
                          <span>{item.label}</span>
                        </div>
                        <FaChevronRight className={`text-xs transition-transform duration-300 ${expandedCategories[item.label] ? 'rotate-90 text-blue-400' : 'text-gray-600'}`} />
                      </button>
                      
                      {/* Submenu List */}
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCategories[item.label] ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-4 space-y-1 border-l border-gray-700 pl-3">
                          {item.subItems.map((subItem, subIndex) => (
                            <NavLink
                              key={subIndex}
                              to={subItem.path}
                              className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  isActive
                                    ? "text-blue-400 font-semibold bg-blue-500/10 translate-x-1"
                                    : "text-gray-500 hover:text-white hover:translate-x-1"
                                }`
                              }
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${location.pathname === subItem.path ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                              <span>{subItem.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    // --- STANDARD MENU (Menu thường) ---
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                            : "hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className={`text-lg relative z-10 transition-transform group-hover:scale-110 duration-200`} />
                      <span className="relative z-10">{item.label}</span>
                    </NavLink>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. USER PROFILE FOOTER */}
      <div className="p-4 border-t border-gray-800/50 bg-[#0b101b] z-10">
        <div className="flex items-center gap-3 mb-4 p-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-500 transition-all cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-gray-800">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{user?.name || "Admin"}</p>
            <p className="text-xs text-gray-500 truncate">Super Admin</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all duration-300 font-medium text-sm border border-red-500/20 hover:border-red-600 group"
        >
          <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;