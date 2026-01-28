import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, toggleWishlist } from "../redux/orebiSlice";
import PriceContainer from "./PriceContainer";
import { FaEye, FaHeart, FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";

const ProductCard = ({ item, viewMode = "grid", className = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Kiểm tra xem sản phẩm này đã được tim chưa
  const wishlist = useSelector((state) => state.orebiReducer.wishlist);
  const isInWishlist = wishlist.some((p) => p._id === item._id);

  const handleProductDetails = () => {
    navigate(`/product/${item._id}`, { state: { item: item } });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ ...item, quantity: 1 }));
    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    dispatch(toggleWishlist(item));
  };

  // --- LIST VIEW ---
  if (viewMode === "list") {
    return (
      <div className={`group flex flex-col sm:flex-row gap-6 bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 ${className}`}>
        <div 
          className="w-full sm:w-48 h-48 flex-shrink-0 relative overflow-hidden bg-gray-50 cursor-pointer rounded-lg"
          onClick={handleProductDetails}
        >
          <img
            className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
            src={item.images?.[0] || item.image}
            alt={item.name}
          />
          {item.offer && (
            <span className="absolute top-2 left-2 bg-destructive text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
              Sale
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center py-2">
          <div className="mb-2">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">{item.category}</span>
            <h3 
              className="text-lg font-bold text-primary mt-1 cursor-pointer hover:text-accent transition-colors truncate"
              onClick={handleProductDetails}
            >
              {item.name}
            </h3>
          </div>
          <p className="text-secondary text-sm line-clamp-2 mb-4 max-w-xl">{item.description}</p>
          <div className="flex items-center gap-4 mt-auto">
            <PriceContainer item={item} className="text-lg font-bold" />
            <button 
                onClick={handleAddToCart}
                className="bg-primary text-white px-6 py-2 hover:bg-accent transition-colors text-xs uppercase font-bold rounded-lg shadow-sm"
            >
                Add to Cart
            </button>
            <button 
                onClick={handleWishlist}
                className={`p-2 rounded-full border transition-all ${
                    isInWishlist ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-secondary hover:text-red-500"
                }`}
            >
                <FaHeart />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- GRID VIEW ---
  return (
    <div className={`group relative w-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 ${className}`}>
      
      {/* Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 cursor-pointer" onClick={handleProductDetails}>
        <img
          className="w-full h-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-110"
          src={item.images?.[0] || item.image}
          alt={item.name}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.offer && (
            <span className="bg-destructive text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-md shadow-sm">
              -{item.discountedPercentage}%
            </span>
          )}
          {item.badge && !item.offer && (
            <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-md shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Action Buttons (Floating) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); handleProductDetails(); }}
            className="w-9 h-9 bg-white text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-md rounded-full"
            title="View Details"
          >
            <FaEye size={14} />
          </button>
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 flex items-center justify-center transition-colors shadow-md rounded-full ${
                isInWishlist ? "bg-red-500 text-white" : "bg-white text-primary hover:bg-red-500 hover:text-white"
            }`}
            title="Wishlist"
          >
            <FaHeart size={14} />
          </button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <button 
                onClick={handleAddToCart}
                className="w-full bg-primary/90 backdrop-blur-sm text-white py-3 rounded-xl font-bold text-sm hover:bg-accent shadow-lg flex items-center justify-center gap-2"
             >
                <FaShoppingCart /> Add to Cart
             </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
           <h3
             className="text-base font-bold text-primary cursor-pointer hover:text-accent transition-colors truncate flex-1 pr-2"
             onClick={handleProductDetails}
           >
             {item.name}
           </h3>
        </div>
        
        <div className="flex justify-between items-center">
            <p className="text-xs text-secondary font-medium uppercase tracking-wide truncate max-w-[50%]">{item.category}</p>
            <PriceContainer item={item} className="text-sm font-bold" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;