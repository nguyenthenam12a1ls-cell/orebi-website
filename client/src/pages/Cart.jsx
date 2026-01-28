import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { resetCart, deleteItem, increaseQuantity, decreaseQuantity } from "../redux/orebiSlice";
import { emptyCart } from "../assets/images";
import Container from "../components/Container";
import PriceFormat from "../components/PriceFormat";
import { FaMinus, FaPlus, FaTrash, FaArrowLeft, FaMapMarkerAlt, FaPlusCircle, FaCheckCircle, FaTimes, FaCreditCard, FaShoppingBag } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";
import { config } from "../../config";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, userInfo } = useSelector((state) => state.orebiReducer);
  
  const [totalAmt, setTotalAmt] = useState(0);
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  
  const [addressForm, setAddressForm] = useState({
    label: "Home", street: "", city: "", state: "", zipCode: "", country: "Vietnam", phone: "", isDefault: false
  });

  useEffect(() => {
    let price = 0;
    products.forEach((item) => {
      price += item.price * item.quantity;
    });
    setTotalAmt(price);
  }, [products]);

  useEffect(() => {
    if (userInfo) {
      fetchAddresses();
    }
  }, [userInfo]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${config?.baseUrl}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAddresses(res.data.addresses);
        const defaultAddr = res.data.addresses.find((addr) => addr.isDefault) || res.data.addresses[0];
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddingAddress(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${config?.baseUrl}/api/user/addresses`, addressForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success("Thêm địa chỉ thành công!");
        fetchAddresses();
        setShowAddressModal(false);
        setAddressForm({ label: "Home", street: "", city: "", state: "", zipCode: "", country: "Vietnam", phone: "", isDefault: false });
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi thêm địa chỉ");
    } finally {
      setAddingAddress(false);
    }
  };

  // ✅ LOGIC MỚI: CHỈ CHUYỂN SANG TRANG CHECKOUT
  const handleProceedToCheckout = () => {
    if (!userInfo) {
      toast.error("Vui lòng đăng nhập để tiếp tục");
      navigate("/signin");
      return;
    }
    
    if (products.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    // Lưu địa chỉ đã chọn vào localStorage (nếu có)
    if (selectedAddress) {
      localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));
    }

    // Chuyển đến trang Checkout - ĐƠN HÀNG SẼ ĐƯỢC TẠO Ở ĐÓ
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-bodyFont">
      
      {/* 1. HERO SECTION - DARK THEME */}
      <div className="relative bg-[#0F172A] text-white pt-20 pb-40 overflow-hidden">
         {/* Họa tiết trang trí */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
         
         <Container>
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                  <span>/</span>
                  <span className="text-accent">Shopping Cart</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Giỏ hàng của bạn</h1>
               <p className="text-gray-400 text-lg">
                  {products.length > 0 
                    ? `Bạn đang có ${products.length} sản phẩm trong giỏ hàng` 
                    : "Giỏ hàng đang trống, hãy mua sắm thêm nhé!"}
               </p>
            </div>
         </Container>
      </div>

      {/* 2. FLOATING CONTENT - NỘI DUNG CHÍNH */}
      <Container className="-mt-24 relative z-20">
        
        {products.length === 0 ? (
           // EMPTY CART STATE
           <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="bg-white rounded-3xl shadow-2xl p-10 text-center flex flex-col items-center min-h-[400px] justify-center"
           >
              <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <img src={emptyCart} alt="empty" className="w-24 opacity-50" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Chưa có sản phẩm nào</h2>
              <p className="text-secondary mb-8">Khám phá bộ sưu tập mới nhất của chúng tôi ngay hôm nay.</p>
              <Link to="/shop">
                 <button className="bg-primary text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                    Mua Sắm Ngay
                 </button>
              </Link>
           </motion.div>
        ) : (
           <div className="flex flex-col lg:flex-row gap-8">
              
              {/* LEFT COLUMN: PRODUCT LIST */}
              <motion.div 
                 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                 className="lg:w-2/3 space-y-6"
              >
                 <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-6 md:p-8">
                       <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                             <FaShoppingBag className="text-accent" /> Danh sách sản phẩm
                          </h2>
                          <button onClick={() => dispatch(resetCart())} className="text-xs font-bold text-red-500 hover:underline uppercase tracking-wide">
                             Làm mới giỏ hàng
                          </button>
                       </div>

                       <div className="space-y-6">
                          {products.map((item) => (
                             <div key={item._id} className="flex flex-col sm:flex-row gap-4 sm:items-center py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors rounded-xl px-2 -mx-2">
                                {/* Image */}
                                <Link to={`/product/${item._id}`} className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                                   <img className="w-full h-full object-contain p-2" src={item.image || item.images?.[0]} alt={item.name} />
                                </Link>

                                {/* Info */}
                                <div className="flex-1">
                                   <div className="flex justify-between items-start">
                                      <div>
                                         <Link to={`/product/${item._id}`} className="font-bold text-lg text-primary hover:text-accent transition-colors line-clamp-1">
                                            {item.name}
                                         </Link>
                                         <p className="text-xs text-secondary uppercase tracking-wider mt-1 mb-2">{item.category}</p>
                                      </div>
                                      <button onClick={() => dispatch(deleteItem(item._id))} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                         <FaTrash />
                                      </button>
                                   </div>

                                   <div className="flex justify-between items-end mt-2">
                                      {/* Quantity */}
                                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                         <button onClick={() => dispatch(decreaseQuantity(item._id))} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-xs shadow-sm hover:text-accent transition-colors"><FaMinus /></button>
                                         <span className="w-10 text-center font-bold text-sm text-primary">{item.quantity}</span>
                                         <button onClick={() => dispatch(increaseQuantity(item._id))} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-xs shadow-sm hover:text-accent transition-colors"><FaPlus /></button>
                                      </div>
                                      
                                      {/* Price */}
                                      <div className="text-right">
                                         <p className="text-xs text-secondary mb-1">Thành tiền</p>
                                         <p className="font-extrabold text-lg text-primary"><PriceFormat amount={item.quantity * item.price} /></p>
                                      </div>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 
                 <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors px-4">
                    <FaArrowLeft /> Tiếp tục mua sắm
                 </Link>
              </motion.div>

              {/* RIGHT COLUMN: SUMMARY & ADDRESS */}
              <motion.div 
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                 className="lg:w-1/3 space-y-6"
              >
                 {/* Address Card */}
                 <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-primary flex items-center gap-2">
                          <FaMapMarkerAlt className="text-accent" /> Địa chỉ giao hàng
                       </h3>
                       {userInfo && (
                          <button onClick={() => setShowAddressModal(true)} className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                             <FaPlusCircle /> Thêm
                          </button>
                       )}
                    </div>

                    {!userInfo ? (
                       <div className="bg-gray-50 rounded-xl p-4 text-center border border-dashed border-gray-300">
                          <p className="text-sm text-secondary mb-2">Đăng nhập để chọn địa chỉ</p>
                          <Link to="/signin" className="text-sm font-bold text-primary underline">Đăng nhập ngay</Link>
                       </div>
                    ) : addresses.length === 0 ? (
                       <button onClick={() => setShowAddressModal(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-secondary hover:border-accent hover:text-accent transition-colors">
                          + Thêm địa chỉ mới
                       </button>
                    ) : (
                       <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                          {addresses.map((addr) => (
                             <div 
                                key={addr._id}
                                onClick={() => setSelectedAddress(addr)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                                   selectedAddress?._id === addr._id 
                                   ? "border-accent bg-blue-50/50 shadow-sm" 
                                   : "border-gray-100 hover:border-gray-300"
                                }`}
                             >
                                <div className="flex items-center justify-between mb-1">
                                   <span className="font-bold text-sm text-primary">{addr.label}</span>
                                   {selectedAddress?._id === addr._id && <FaCheckCircle className="text-accent text-sm" />}
                                </div>
                                <p className="text-xs text-secondary line-clamp-2">{addr.street}, {addr.city}</p>
                                <p className="text-xs font-mono font-bold text-gray-500 mt-1">{addr.phone}</p>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>

                 {/* Order Summary Card */}
                 <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <h3 className="font-bold text-xl text-primary mb-6 flex items-center gap-2">
                       <FaCreditCard /> Tóm tắt đơn hàng
                    </h3>

                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                       <div className="flex justify-between text-sm text-secondary">
                          <span>Tạm tính ({products.length} sản phẩm)</span>
                          <span className="font-bold text-primary"><PriceFormat amount={totalAmt} /></span>
                       </div>
                       <div className="flex justify-between text-sm text-secondary">
                          <span>Giảm giá</span>
                          <span className="text-primary font-medium">0đ</span>
                       </div>
                       <div className="flex justify-between text-sm text-secondary">
                          <span>Vận chuyển</span>
                          <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-xs">Miễn phí</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-end mb-8">
                       <span className="font-bold text-lg text-primary">Tổng cộng</span>
                       <span className="font-extrabold text-3xl text-accent"><PriceFormat amount={totalAmt} /></span>
                    </div>

                    {/* ✅ NÚT THANH TOÁN - CHỈ CHUYỂN TRANG */}
                    <button 
                       onClick={handleProceedToCheckout}
                       className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                       Tiến hành thanh toán
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                       {userInfo && !selectedAddress 
                          ? "💡 Chọn địa chỉ giao hàng trước khi thanh toán" 
                          : "Bạn sẽ xác nhận thông tin ở bước tiếp theo"}
                    </p>
                 </div>
              </motion.div>
           </div>
        )}
      </Container>

      {/* ADD ADDRESS MODAL */}
      <AnimatePresence>
        {showAddressModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowAddressModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                ></motion.div>
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl z-10 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-lg text-primary">Thêm địa chỉ mới</h3>
                        <button onClick={() => setShowAddressModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                            <FaTimes />
                        </button>
                    </div>
                    
                    <form onSubmit={handleAddAddress} className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-secondary uppercase">Loại</label>
                                <select 
                                    value={addressForm.label}
                                    onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-accent outline-none transition-all"
                                >
                                    <option value="Home">Nhà riêng</option>
                                    <option value="Work">Văn phòng</option>
                                    <option value="Other">Khác</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-secondary uppercase">SĐT</label>
                                <input 
                                    required type="text" placeholder="09..." 
                                    value={addressForm.phone}
                                    onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-accent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-secondary uppercase">Địa chỉ</label>
                            <input 
                                required type="text" placeholder="Số nhà, đường..." 
                                value={addressForm.street}
                                onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-accent outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input required type="text" placeholder="Tỉnh/TP" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-accent outline-none" />
                            <input required type="text" placeholder="Quận/Huyện" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-accent outline-none" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <input required type="text" placeholder="Zip Code" value={addressForm.zipCode} onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-accent outline-none" />
                            <input required type="text" placeholder="Quốc gia" value={addressForm.country} onChange={(e) => setAddressForm({...addressForm, country: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-accent outline-none" />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent cursor-pointer" />
                            <label htmlFor="isDefault" className="text-sm font-bold text-primary cursor-pointer select-none">Đặt làm mặc định</label>
                        </div>

                        <button type="submit" disabled={addingAddress} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold uppercase tracking-wider hover:bg-black transition-all shadow-lg hover:shadow-xl mt-2 disabled:opacity-70">
                            {addingAddress ? "Đang lưu..." : "Lưu Địa Chỉ"}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;