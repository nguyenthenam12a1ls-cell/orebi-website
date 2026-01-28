import { useState, useEffect } from "react";
import { config } from "../../../config";
import axios from "axios";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

const ProductsSideNav = ({ onFilterChange, filters, onClearFilters }) => {
  // 1. DỮ LIỆU MẶC ĐỊNH (Fallback khi API lỗi)
  const defaultCategories = [
    { _id: 1, name: "Bags" },
    { _id: 2, name: "Electronics" },
    { _id: 3, name: "Accessories" },
    { _id: 4, name: "Home" },
    { _id: 5, name: "Toys" }
  ];

  const defaultBrands = [
    { _id: 1, name: "Orebi" },
    { _id: 2, name: "Samsung" },
    { _id: 3, name: "Apple" },
  ];

  const [categories, setCategories] = useState(defaultCategories);
  const [brands, setBrands] = useState(defaultBrands);
  
  // State quản lý đóng mở các mục filter
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Gọi API lấy Category & Brand
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get(`${config?.baseUrl}/api/category`),
          axios.get(`${config?.baseUrl}/api/brand`)
        ]);

        if (catRes.data.success && catRes.data.categories.length > 0) {
          setCategories(catRes.data.categories);
        }
        if (brandRes.data.success && brandRes.data.brands.length > 0) {
          setBrands(brandRes.data.brands);
        }
      } catch (error) {
        console.log("⚠️ Using default filters due to API error");
      }
    };
    fetchFilters();
  }, []);

  // Xử lý chọn Category
  const handleCategoryChange = (name) => {
    const newVal = filters?.category === name ? "" : name;
    console.log("📂 Category selected:", newVal || "None");
    onFilterChange({ category: newVal });
  };

  // Xử lý chọn Brand
  const handleBrandChange = (name) => {
    const newVal = filters?.brand === name ? "" : name;
    console.log("🏷️ Brand selected:", newVal || "None");
    onFilterChange({ brand: newVal });
  };

  // 🔥 XỬ LÝ CHỌN GIÁ - TỰ ĐỘNG SCROLL
  const handlePriceChange = (val) => {
    const newVal = filters?.priceRange === val ? "" : val;
    
    // Log chi tiết để debug
    if (newVal) {
      const [min, max] = val.split("-");
      console.log("💰 Price range selected:", {
        range: val,
        min: min,
        max: max,
        display: `${min} - ${max}`
      });
    } else {
      console.log("💰 Price filter cleared");
    }
    
    // ✅ Gọi callback để Shop.jsx xử lý scroll
    onFilterChange({ priceRange: newVal });
  };

  // 🔥 DANH SÁCH KHOẢNG GIÁ - ĐƯỢC TỐI ƯU
  const priceRanges = [
    { label: "$0 - $50", val: "0-50", count: "Budget" },
    { label: "$50 - $100", val: "50-100", count: "Popular" },
    { label: "$100 - $200", val: "100-200", count: "Mid-range" },
    { label: "$200 - $500", val: "200-500", count: "Premium" },
    { label: "Over $500", val: "500-999999", count: "Luxury" },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header & Clear Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Filters</h2>
        {(filters?.category || filters?.brand || filters?.priceRange) && (
          <button 
            onClick={() => {
              console.log("🧹 All filters cleared");
              onClearFilters();
            }}
            className="text-xs font-bold text-red-500 hover:underline hover:text-red-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* 1. CATEGORIES */}
      <div className="w-full border-b border-gray-100 pb-6">
        <div 
          onClick={() => toggleSection("category")}
          className="cursor-pointer flex justify-between items-center mb-4 select-none group"
        >
          <h3 className="font-bold text-base text-primary group-hover:text-accent transition-colors">
            Shop by Category
          </h3>
          <span className="text-secondary text-sm">
            {openSections.category ? <FaAngleUp /> : <FaAngleDown />}
          </span>
        </div>
        
        {openSections.category && (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((item) => (
              <div 
                key={item._id}
                onClick={() => handleCategoryChange(item.name)}
                className={`flex items-center justify-between cursor-pointer py-2 px-3 rounded-lg transition-all ${
                  filters?.category === item.name 
                    ? "bg-black text-white font-medium shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <span className="text-sm">{item.name}</span>
                {filters?.category === item.name && (
                  <span className="text-xs font-bold">✕</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. BRANDS */}
      <div className="w-full border-b border-gray-100 pb-6">
        <div 
          onClick={() => toggleSection("brand")}
          className="cursor-pointer flex justify-between items-center mb-4 select-none group"
        >
          <h3 className="font-bold text-base text-primary group-hover:text-accent transition-colors">
            Shop by Brand
          </h3>
          <span className="text-secondary text-sm">
            {openSections.brand ? <FaAngleUp /> : <FaAngleDown />}
          </span>
        </div>
        
        {openSections.brand && (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {brands.map((item) => (
              <div 
                key={item._id}
                onClick={() => handleBrandChange(item.name)}
                className={`flex items-center justify-between cursor-pointer py-2 px-3 rounded-lg transition-all ${
                  filters?.brand === item.name 
                    ? "bg-black text-white font-medium shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <span className="text-sm">{item.name}</span>
                {filters?.brand === item.name && (
                  <span className="text-xs font-bold">✕</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PRICE - 🔥 PHẦN NÀY ĐƯỢC CẢI TIẾN */}
      <div className="w-full">
        <div 
          onClick={() => toggleSection("price")}
          className="cursor-pointer flex justify-between items-center mb-4 select-none group"
        >
          <h3 className="font-bold text-base text-primary group-hover:text-accent transition-colors">
            Shop by Price
          </h3>
          <span className="text-secondary text-sm">
            {openSections.price ? <FaAngleUp /> : <FaAngleDown />}
          </span>
        </div>
        
        {openSections.price && (
          <div className="flex flex-col gap-2">
            {priceRanges.map((item) => {
              const isActive = filters?.priceRange === item.val;
              
              return (
                <div 
                  key={item.val}
                  onClick={() => handlePriceChange(item.val)}
                  className={`flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-lg transition-all group/price ${
                    isActive
                      ? "bg-black text-white font-medium shadow-sm" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className={`text-xs ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                      {item.count}
                    </span>
                  </div>
                  {isActive && (
                    <span className="text-xs font-bold">✕</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🔥 HIỂN THỊ BỘ LỌC ĐANG CHỌN */}
      {(filters?.category || filters?.brand || filters?.priceRange) && (
        <div className="w-full pt-4 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Active Filters
          </p>
          <div className="flex flex-wrap gap-2">
            {filters?.category && (
              <span className="inline-flex items-center gap-2 bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full">
                {filters.category}
                <button 
                  onClick={() => handleCategoryChange(filters.category)}
                  className="hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </span>
            )}
            {filters?.brand && (
              <span className="inline-flex items-center gap-2 bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full">
                {filters.brand}
                <button 
                  onClick={() => handleBrandChange(filters.brand)}
                  className="hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </span>
            )}
            {filters?.priceRange && (
              <span className="inline-flex items-center gap-2 bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full">
                ${filters.priceRange.replace("-", " - $")}
                <button 
                  onClick={() => handlePriceChange(filters.priceRange)}
                  className="hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSideNav;