import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import Container from "../components/Container";
import ProductsSideNav from "../components/products/ProductsSideNav";
import PaginationProductList from "../components/products/PaginationProductList";
import { config } from "../../config";
import axios from "axios";
import { FaFilter, FaThLarge, FaList, FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";

const Shop = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý bộ lọc
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    priceRange: "", // Chuỗi dạng "0-50", "50-100"...
    search: "",
  });
  
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // 🔥 REF để scroll đến vị trí product list
  const productListRef = useRef(null);

  // 1. Đọc URL params lần đầu
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (categoryParam || searchParam) {
      setFilters((prev) => ({
        ...prev,
        category: categoryParam || "",
        search: searchParam || "",
      }));
    }
  }, [location.search]);

  // 2. Gọi API lấy sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("_page", currentPage);
        params.append("_limit", itemsPerPage);
        
        if (filters.category) params.append("category", filters.category);
        if (filters.brand) params.append("brand", filters.brand);
        if (filters.search) params.append("q", filters.search);

        // 🔥 LOGIC LỌC GIÁ - HỖ TRỢ NHIỀU FORMAT BACKEND
        if (filters.priceRange) {
          const [min, max] = filters.priceRange.split("-").map(Number);
          
          if (!isNaN(min) && !isNaN(max)) {
            // Thử cả 3 format phổ biến nhất:
            
            // 🔥 CHỌN FORMAT PHÙ HỢP VỚI BACKEND CỦA BẠN:
            
            // Format 1: json-server style (ĐANG DÙNG)
            params.append("price_gte", min);
            params.append("price_lte", max);
            
            // Format 2: REST API style - UNCOMMENT nếu backend dùng format này
            // params.append("minPrice", min);
            // params.append("maxPrice", max);
            
            // Format 3: price_min, price_max - UNCOMMENT nếu backend dùng format này
            // params.append("price_min", min);
            // params.append("price_max", max);
            
            // Format 4: Single parameter - UNCOMMENT nếu backend dùng format này
            // params.append("price", filters.priceRange);
            
            // Format 5: priceFrom, priceTo - UNCOMMENT nếu backend dùng format này
            // params.append("priceFrom", min);
            // params.append("priceTo", max);
            
            console.log("🔍 Filter giá:", { min, max, priceRange: filters.priceRange });
          }
        }
        
        const endpoint = `${config?.baseUrl}/api/products?${params.toString()}`;
        console.log("📡 API Request:", endpoint);
        
        const response = await axios.get(endpoint);
        console.log("📦 API Response:", response.data);

        if (response.data.success) {
          let fetchedProducts = response.data.products || [];
          
          // 🔥 FALLBACK: Nếu backend KHÔNG hỗ trợ filter giá, lọc ở frontend
          if (filters.priceRange && fetchedProducts.length > 0) {
            const [min, max] = filters.priceRange.split("-").map(Number);
            
            if (!isNaN(min) && !isNaN(max)) {
              fetchedProducts = fetchedProducts.filter(product => {
                const price = Number(product.price);
                return price >= min && price <= max;
              });
              
              console.log(`✅ Frontend filter: ${fetchedProducts.length} sản phẩm trong khoảng $${min}-$${max}`);
            }
          }
          
          setProducts(fetchedProducts);
          setTotalItems(response.data.totalItems || fetchedProducts.length);
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, currentPage, itemsPerPage]);

  // Sắp xếp Client-side
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const handleFilterChange = (newFilters) => {
    console.log("🎯 Filter thay đổi:", newFilters);
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    
    // 🔥 TỰ ĐỘNG SCROLL LÊN PHẦN SẢN PHẨM
    setTimeout(() => {
      productListRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }, 100);
  };

  const clearFilters = () => {
    console.log("🧹 Xóa tất cả filter");
    setFilters({ category: "", brand: "", priceRange: "", search: "" });
    setCurrentPage(1);
    
    // 🔥 SCROLL LÊN ĐẦU TRANG KHI XÓA BỘ LỌC
    setTimeout(() => {
      productListRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }, 100);
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-bodyFont">
      
      {/* HEADER & HERO SECTION */}
      <div className="relative bg-primary text-white mb-10 overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent opacity-10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

         <Container>
            <div className="relative z-10 py-16 md:py-24 flex flex-col items-center text-center gap-6">
               <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/5"
               >
                  <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-white">Shop</span>
               </motion.div>
               
               <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-6xl font-extrabold tracking-tight"
               >
                  Our Collection
               </motion.h1>
               
               <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
               >
                  Khám phá <span className="text-accent font-bold">{totalItems}</span> sản phẩm chất lượng cao.
               </motion.p>
            </div>
         </Container>
      </div>

      <Container>
        <div className="flex gap-10 lg:gap-14 items-start">
          
          {/* SIDEBAR (Desktop) */}
          <div className="hidden lg:block w-[250px] flex-shrink-0 sticky top-24 pr-4">
            <h3 className="font-bold text-base mb-6 text-primary uppercase tracking-widest border-b border-gray-100 pb-2">Filters</h3>
            <ProductsSideNav 
              onFilterChange={handleFilterChange} 
              filters={filters} 
              onClearFilters={clearFilters}
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 w-full min-w-0">
              
              {/* 🔥 ĐIỂM NEO ĐỂ SCROLL ĐẾN */}
              <div ref={productListRef} className="scroll-mt-24"></div>
              
              {/* TOOLBAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
                 <button 
                    onClick={() => setShowMobileFilter(true)}
                    className="lg:hidden flex items-center gap-2 text-primary font-bold border border-gray-200 px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all self-start"
                 >
                    <FaFilter size={12} /> Filter Products
                 </button>

                 <p className="text-sm text-secondary hidden sm:block">
                    Showing <strong>{products.length}</strong> of <strong>{totalItems}</strong> results
                    {filters.priceRange && (
                      <span className="ml-2 text-accent font-bold">
                        (${filters.priceRange.replace("-", " - $")})
                      </span>
                    )}
                 </p>

                 <div className="flex items-center gap-6 ml-auto">
                    <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-400">Sort by:</span>
                       <div className="relative group">
                          <select 
                             value={sortBy}
                             onChange={(e) => setSortBy(e.target.value)}
                             className="appearance-none bg-transparent text-sm text-primary font-bold pr-8 cursor-pointer focus:outline-none"
                          >
                             <option value="newest">Newest First</option>
                             <option value="price-low">Price: Low - High</option>
                             <option value="price-high">Price: High - Low</option>
                             <option value="name">Name: A - Z</option>
                          </select>
                          <FaChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 group-hover:text-primary pointer-events-none" />
                       </div>
                    </div>

                    <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                       <button 
                          onClick={() => setViewMode("grid")}
                          className={`transition-colors ${viewMode === "grid" ? "text-primary" : "text-gray-300 hover:text-gray-500"}`}
                       >
                          <FaThLarge size={18} />
                       </button>
                       <button 
                          onClick={() => setViewMode("list")}
                          className={`transition-colors ${viewMode === "list" ? "text-primary" : "text-gray-300 hover:text-gray-500"}`}
                       >
                          <FaList size={18} />
                       </button>
                    </div>
                 </div>
              </div>

            {/* PRODUCT LIST */}
            {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1,2,3,4,5,6].map(n => (
                     <div key={n} className="flex flex-col gap-4">
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="space-y-2">
                           <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                           <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : products.length > 0 ? (
               <div className="animate-fade-in">
                  <PaginationProductList
                     products={sortedProducts}
                     viewMode={viewMode}
                     currentPage={currentPage}
                     itemsPerPage={itemsPerPage}
                     totalItems={totalItems}
                     onPageChange={setCurrentPage}
                  />
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6">
                     🔍
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-secondary mb-8 max-w-md">
                     Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.
                     {filters.priceRange && (
                       <span className="block mt-2 font-bold text-accent">
                         Khoảng giá: ${filters.priceRange.replace("-", " - $")}
                       </span>
                     )}
                  </p>
                  <button 
                     onClick={clearFilters} 
                     className="bg-black text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all"
                  >
                     Xóa bộ lọc
                  </button>
               </div>
            )}
          </div>
        </div>
      </Container>

      {/* MOBILE SIDEBAR OVERLAY */}
      {showMobileFilter && (
         <div className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-sm transition-opacity">
            <div className="bg-white w-[85%] max-w-[320px] h-full p-6 overflow-y-auto animate-slide-in-right shadow-2xl">
               <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                  <h2 className="font-bold text-lg text-primary uppercase tracking-widest">Filters</h2>
                  <button 
                     onClick={() => setShowMobileFilter(false)} 
                     className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-colors"
                  >
                     &times;
                  </button>
               </div>
               <ProductsSideNav 
                  onFilterChange={handleFilterChange} 
                  filters={filters} 
                  onClearFilters={clearFilters}
               />
               <div className="mt-8 pt-4 border-t border-gray-100">
                  <button 
                     onClick={() => setShowMobileFilter(false)}
                     className="w-full bg-black text-white py-4 rounded-full font-bold uppercase text-sm tracking-widest hover:bg-gray-800"
                  >
                     Xem kết quả
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Shop;