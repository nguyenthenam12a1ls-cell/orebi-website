import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toggleWishlist, addToCart } from "../redux/orebiSlice";
import Container from "../components/Container";
import { FaTrash, FaShoppingCart, FaHeartBroken, FaEye } from "react-icons/fa";
import PriceFormat from "../components/PriceFormat";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Wishlist = () => {
  const dispatch = useDispatch();
  // 🔥 FIX QUAN TRỌNG: Thêm || [] để tránh lỗi map null/undefined
  const wishlist = useSelector((state) => state.orebiReducer.wishlist || []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-bodyFont">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-[#0F172A] text-white pt-20 pb-40 overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
         
         <Container>
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                  <span>/</span>
                  <span className="text-accent">Wishlist</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Sản phẩm yêu thích</h1>
               <p className="text-gray-400 text-lg">
                  {wishlist.length > 0 
                    ? `Bạn đang lưu ${wishlist.length} sản phẩm để mua sau` 
                    : "Danh sách yêu thích của bạn đang trống"}
               </p>
            </div>
         </Container>
      </div>

      {/* 2. FLOATING CONTENT */}
      <Container className="-mt-24 relative z-20">
        {wishlist.length === 0 ? (
           // EMPTY STATE
           <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="bg-white rounded-3xl shadow-2xl p-10 text-center flex flex-col items-center min-h-[400px] justify-center"
           >
              <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                 <FaHeartBroken className="text-6xl opacity-50" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Chưa có sản phẩm yêu thích</h2>
              <p className="text-secondary mb-8">Hãy dạo một vòng cửa hàng và "thả tim" cho những món đồ bạn thích nhé!</p>
              <Link to="/shop">
                 <button className="bg-primary text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                    Đi tới Cửa hàng
                 </button>
              </Link>
           </motion.div>
        ) : (
           // WISHLIST GRID
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence>
                 {wishlist.map((item) => (
                    <motion.div 
                       key={item._id}
                       layout
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       transition={{ duration: 0.3 }}
                       className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col"
                    >
                       {/* Image Area */}
                       <div className="relative aspect-square bg-gray-50 p-6 flex items-center justify-center overflow-hidden">
                          <img 
                             src={item.images?.[0] || item.image} 
                             alt={item.name} 
                             className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" 
                          />
                          
                          {/* Floating Buttons */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                             <button 
                                onClick={() => dispatch(toggleWishlist(item))}
                                className="w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-colors"
                                title="Bỏ yêu thích"
                             >
                                <FaTrash size={14} />
                             </button>
                             <Link to={`/product/${item._id}`}>
                                <button className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors" title="Xem chi tiết">
                                   <FaEye size={14} />
                                </button>
                             </Link>
                          </div>

                          {/* Stock Badge */}
                          <div className="absolute top-4 left-4">
                             <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm ${item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {item.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                             </span>
                          </div>
                       </div>

                       {/* Info Area */}
                       <div className="p-6 flex flex-col flex-1">
                          <div className="flex-1">
                             <p className="text-xs text-secondary uppercase tracking-widest mb-1">{item.category}</p>
                             <h3 className="font-bold text-primary text-lg truncate mb-2 group-hover:text-accent transition-colors">
                                <Link to={`/product/${item._id}`}>{item.name}</Link>
                             </h3>
                             <div className="flex items-center justify-between mb-4">
                                <PriceFormat amount={item.price} className="font-extrabold text-xl text-primary" />
                             </div>
                          </div>

                          <button 
                             onClick={() => {
                                dispatch(addToCart({...item, quantity: 1}));
                                toast.success("Đã thêm vào giỏ hàng");
                             }}
                             className="w-full py-3 rounded-xl bg-gray-50 text-primary font-bold text-sm border border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 group/btn"
                          >
                             <FaShoppingCart className="group-hover/btn:scale-110 transition-transform" /> Thêm vào giỏ
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        )}
      </Container>
    </div>
  );
};

export default Wishlist;