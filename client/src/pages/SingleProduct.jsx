import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import Container from "../components/Container";
import { 
  FaStar, FaHeart, FaShippingFast, FaUndo, FaShieldAlt, 
  FaRegStar, FaUserCircle, FaCube 
} from "react-icons/fa"; // Import FaCube cho icon 3D
import { useDispatch, useSelector } from "react-redux";
import { addToCart, toggleWishlist } from "../redux/orebiSlice";
import toast from "react-hot-toast";
import ProductCard from "../components/ProductCard";
import axios from "axios";
import { config } from "../../config";
import PriceFormat from "../components/PriceFormat";

// --- 1. IMPORT MODEL VIEWER ---
import '@google/model-viewer';

const SingleProduct = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const wishlist = useSelector((state) => state.orebiReducer.wishlist || []);
  const userInfo = useSelector((state) => state.orebiReducer.userInfo);

  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // --- 2. STATE HIỂN THỊ 3D ---
  const [show3D, setShow3D] = useState(false);

  // State cho phần Đánh giá
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (productInfo) {
      const exists = wishlist.find((item) => item._id === productInfo._id);
      setIsInWishlist(!!exists);
    }
  }, [wishlist, productInfo]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config?.baseUrl}/api/products/single?_id=${id}`);
      if (response.data.success) {
        const product = response.data.product;
        setProductInfo(product);
        setSelectedImage(product.images?.[0] || product.image);

        // --- 3. LOGIC TỰ ĐỘNG BẬT 3D ---
        // Nếu sản phẩm có trường model3DUrl -> Mặc định bật chế độ xem 3D
        if (product.model3DUrl) {
          setShow3D(true);
        } else {
          setShow3D(false);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    setQuantity(1); 
    window.scrollTo(0, 0);
    setActiveTab("description");
  }, [id]);

  useEffect(() => {
    if (productInfo?.category) {
      const fetchRelated = async () => {
        try {
          const res = await axios.get(
            `${config?.baseUrl}/api/products?category=${productInfo.category}&_perPage=4`
          );
          if (res.data.success) {
            const related = res.data.products.filter(p => p._id !== productInfo._id);
            setRelatedProducts(related.slice(0, 4));
          }
        } catch (error) { console.log(error); }
      };
      fetchRelated();
    }
  }, [productInfo]);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...productInfo, quantity: quantity }));
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(productInfo));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Vui lòng chọn số sao để đánh giá");
    if (!comment.trim()) return toast.error("Vui lòng nhập nội dung đánh giá");

    setReviewLoading(true);
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
            `${config?.baseUrl}/api/products/${id}/reviews`,
            { rating, comment },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
            toast.success("Đánh giá thành công!");
            setRating(0);
            setComment("");
            fetchProductData();
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
    } finally {
        setReviewLoading(false);
    }
  };

  const renderStars = (val) => {
      return [...Array(5)].map((_, index) => (
          <FaStar key={index} className={index < val ? "text-yellow-400" : "text-gray-300"} />
      ));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  if (!productInfo) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold">Không tìm thấy sản phẩm</h2>
        <Link to="/shop" className="text-primary underline">Quay lại cửa hàng</Link>
    </div>
  );

  const images = productInfo.images?.length > 0 ? productInfo.images : [productInfo.image];

  return (
    <div className="w-full bg-white min-h-screen pb-20 font-bodyFont">
      <div className="bg-[#F8FAFC] py-4 border-b border-gray-100 mb-8">
        <Container>
          <div className="text-xs text-secondary flex items-center gap-2">
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link> 
            <span>/</span> 
            <span>{productInfo.category}</span> 
            <span>/</span> 
            <span className="text-primary font-medium truncate max-w-[200px]">{productInfo.name}</span>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* ========================================================= */}
          {/* KHU VỰC HIỂN THỊ ẢNH & 3D MODEL                           */}
          {/* ========================================================= */}
          <div className="flex flex-col gap-4">
            {/* Khung chính */}
            <div className="w-full aspect-square bg-[#F5F7FA] rounded-2xl overflow-hidden border border-gray-100 relative group">
              
              {/* --- LOGIC HIỂN THỊ: 3D hoặc 2D --- */}
              {show3D && productInfo.model3DUrl ? (
                // --- COMPONENT 3D MODEL VIEWER ---
                <model-viewer
                  src={productInfo.model3DUrl}
                  poster={selectedImage} // Ảnh chờ tải
                  alt={`Mô hình 3D của ${productInfo.name}`}
                  shadow-intensity="1" // Đổ bóng
                  camera-controls // Cho phép xoay
                  auto-rotate // Tự động xoay
                  ar // Bật AR
                  ar-modes="webxr scene-viewer quick-look"
                  class="w-full h-full object-cover rounded-2xl"
                  style={{ width: '100%', height: '100%', backgroundColor: '#F5F7FA' }}
                >
                  {/* Nút AR: "Xem trong không gian của bạn" */}
                  <button 
                    slot="ar-button" 
                    className="absolute bottom-12 right-4 bg-[#1D262D] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-black hover:scale-105 transition-all z-10 cursor-pointer border border-white/10"
                  >
                    <FaCube className="text-lg" />
                    <span>Xem AR</span>
                  </button>
                  
                  {/* Thanh loading khi tải model */}
                  <div slot="progress-bar" className="w-full h-1 bg-gray-200 absolute top-0 left-0">
                    <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                  </div>
                </model-viewer>
              ) : (
                // --- ẢNH TĨNH 2D TRUYỀN THỐNG ---
                <>
                  <img src={selectedImage} alt={productInfo.name} className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                  {productInfo.offer && <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">SALE</span>}
                </>
              )}
            </div>

            {/* --- LIST THUMBNAIL (ẢNH NHỎ) --- */}
            {(images.length > 1 || productInfo.model3DUrl) && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                
                {/* 1. Nút Thumbnail kích hoạt lại 3D (Chỉ hiện nếu có model) */}
                {productInfo.model3DUrl && (
                   <div 
                     onClick={() => setShow3D(true)} 
                     title="Xem mô hình 3D"
                     className={`w-20 h-20 flex-shrink-0 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 ${show3D ? "border-primary ring-2 ring-primary/20" : "border-transparent"}`}
                   >
                     <FaCube size={22} className={show3D ? "text-primary" : "text-gray-600"} />
                     <span className={`text-[10px] font-bold ${show3D ? "text-primary" : "text-gray-600"}`}>3D View</span>
                   </div>
                )}

                {/* 2. Danh sách ảnh 2D */}
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setSelectedImage(img);
                      setShow3D(false); // Khi bấm vào ảnh thì tắt chế độ 3D
                    }} 
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${(!show3D && selectedImage === img) ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT INFO (Giữ nguyên không thay đổi) */}
          <div className="flex flex-col h-full">
            <div className="sticky top-24">
              <p className="text-sm text-accent font-bold uppercase tracking-widest mb-2">{productInfo.brand || "Orebi Collection"}</p>
              <h1 className="text-3xl lg:text-4xl font-titleFont font-bold text-primary mb-4 leading-tight">{productInfo.name}</h1>

              <div className="flex items-center gap-6 mb-6">
                <div className="text-2xl font-bold text-primary"><PriceFormat amount={productInfo.price} /></div>
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  {renderStars(productInfo.rating)}
                  <span className="text-secondary ml-2 text-xs font-medium">({productInfo.numReviews} đánh giá)</span>
                </div>
              </div>

              <p className="text-secondary leading-relaxed mb-8 border-b border-gray-100 pb-8">{productInfo.description}</p>

              <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-primary uppercase">Số lượng</span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="px-4 py-2 hover:bg-gray-50 text-secondary">-</button>
                    <span className="px-2 font-medium text-primary w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 hover:bg-gray-50 text-secondary">+</button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleAddToCart} className="flex-1 bg-primary text-white py-4 rounded-full font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg hover:shadow-accent/30">Thêm vào giỏ</button>
                  <button onClick={handleWishlist} className={`w-14 h-14 flex items-center justify-center border rounded-full transition-all ${isInWishlist ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-secondary hover:text-red-500 hover:border-red-200 hover:bg-red-50"}`}>
                    <FaHeart className="text-xl" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-[#F8FAFC] rounded-xl">
                  <FaShippingFast className="text-2xl text-primary" /><span className="text-xs font-medium text-secondary">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-[#F8FAFC] rounded-xl">
                  <FaUndo className="text-2xl text-primary" /><span className="text-xs font-medium text-secondary">Free Returns</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 bg-[#F8FAFC] rounded-xl">
                  <FaShieldAlt className="text-2xl text-primary" /><span className="text-xs font-medium text-secondary">2 Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABS: DESCRIPTION & REVIEWS --- */}
        <div className="mt-20">
            <div className="flex border-b border-gray-200 mb-8">
                <button 
                    onClick={() => setActiveTab("description")}
                    className={`pb-4 px-6 font-bold text-lg transition-all border-b-2 ${activeTab === "description" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    Mô tả chi tiết
                </button>
                <button 
                    onClick={() => setActiveTab("reviews")}
                    className={`pb-4 px-6 font-bold text-lg transition-all border-b-2 ${activeTab === "reviews" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                    Đánh giá ({productInfo.numReviews})
                </button>
            </div>

            {activeTab === "description" ? (
                <div className="max-w-3xl text-secondary leading-relaxed space-y-4 animate-fade-in">
                    <p>{productInfo.description}</p>
                    <p className="text-gray-400 italic text-sm">Thông tin thêm: Sản phẩm được bảo hành chính hãng, cam kết chất lượng 100%.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
                    {/* DANH SÁCH ĐÁNH GIÁ */}
                    <div className="space-y-6">
                        {productInfo.reviews && productInfo.reviews.length > 0 ? (
                            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
                                {productInfo.reviews.map((review, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                {review.avatar ? (
                                                    <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                                        <FaUserCircle size={24} />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-primary text-sm">{review.name}</h4>
                                                    <div className="flex text-yellow-400 text-xs mt-0.5">{renderStars(review.rating)}</div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                                        </div>
                                        <p className="text-secondary text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                <div className="text-4xl mb-3">📝</div>
                                <p className="text-gray-500 font-medium">Chưa có đánh giá nào.</p>
                                <p className="text-sm text-gray-400">Hãy là người đầu tiên chia sẻ cảm nhận về sản phẩm này!</p>
                            </div>
                        )}
                    </div>

                    {/* FORM VIẾT ĐÁNH GIÁ */}
                    <div className="bg-white border border-gray-200 p-8 rounded-2xl h-fit sticky top-24 shadow-sm">
                        <h3 className="text-xl font-bold mb-2 text-primary">Viết đánh giá của bạn</h3>
                        <p className="text-sm text-gray-500 mb-6">Đánh giá của bạn giúp mọi người mua sắm tốt hơn.</p>
                        
                        {userInfo ? (
                            <form onSubmit={handleSubmitReview} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Bạn chấm mấy sao?</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="text-3xl focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                            >
                                                {star <= (hoverRating || rating) ? (
                                                    <FaStar className="text-yellow-400 drop-shadow-sm" />
                                                ) : (
                                                    <FaRegStar className="text-gray-300" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 font-medium">
                                        {rating === 1 && "Rất tệ"}
                                        {rating === 2 && "Không hài lòng"}
                                        {rating === 3 && "Bình thường"}
                                        {rating === 4 && "Hài lòng"}
                                        {rating === 5 && "Tuyệt vời!"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung đánh giá</label>
                                    <textarea 
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-[120px] text-sm"
                                        placeholder="Chất lượng sản phẩm thế nào? Giao hàng có nhanh không?"
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={reviewLoading}
                                    className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    {reviewLoading ? "Đang gửi..." : "Gửi Đánh Giá"}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-600 mb-4 font-medium">Vui lòng đăng nhập để viết đánh giá.</p>
                                <button onClick={() => navigate("/signin")} className="text-primary font-bold underline hover:text-accent transition-colors">Đăng nhập ngay</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-gray-100 pt-16">
            <h3 className="text-2xl font-bold font-titleFont text-primary mb-8">Có thể bạn sẽ thích</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default SingleProduct;