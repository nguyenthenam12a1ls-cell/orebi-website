import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { config } from "../../config";
import { resetCart } from "../redux/orebiSlice";
import StripePayment from "../components/StripePayment";
import Container from "../components/Container";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaPhoneAlt, FaUser, FaCity, FaCreditCard, FaCheckCircle, FaArrowRight, FaImage } from "react-icons/fa";
import PriceFormat from "../components/PriceFormat";
import { motion } from "framer-motion";

const Checkout = () => {
  const { products, userInfo } = useSelector((state) => state.orebiReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [totalAmt, setTotalAmt] = useState(0);

  // State địa chỉ
  const [address, setAddress] = useState({
    firstName: userInfo?.name?.split(" ")[0] || "",
    lastName: userInfo?.name?.split(" ").slice(1).join(" ") || ".",
    email: userInfo?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Vietnam",
    zipcode: "",
  });

  // Tự động điền địa chỉ từ LocalStorage (nếu có từ Cart)
  useEffect(() => {
    const savedAddressJSON = localStorage.getItem("selectedAddress");
    if (savedAddressJSON) {
      const savedAddress = JSON.parse(savedAddressJSON);
      setAddress((prev) => ({
        ...prev,
        phone: savedAddress.phone || prev.phone,
        street: savedAddress.street || "",
        city: savedAddress.city || "",
        state: savedAddress.state || "",
        country: savedAddress.country || "Vietnam",
        zipcode: savedAddress.zipCode || "", 
      }));
    }
  }, []);

  // Tính tổng tiền
  useEffect(() => {
    let price = 0;
    products.forEach((item) => (price += item.price * item.quantity));
    setTotalAmt(price);
  }, [products]);

  // Check giỏ hàng trống
  useEffect(() => {
      if(products.length === 0 && step === 1 && !orderId) {
          navigate("/cart");
          toast.error("Giỏ hàng của bạn đang trống");
      }
  }, [products, navigate, step, orderId]);

  const handleAddressChange = (e) => {
      setAddress({ ...address, [e.target.name]: e.target.value });
  }

  // Tạo đơn hàng (Bước 1 -> Bước 2)
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!address.firstName || !address.phone || !address.street || !address.city) {
        return toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${config?.baseUrl}/api/order/create`,
        {
          items: products,
          amount: totalAmt,
          address: address,
          paymentMethod: "stripe"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const newOrderId = res.data.orderId;
        toast.success("Thông tin giao hàng đã được xác nhận!");
        setOrderId(newOrderId);
        localStorage.removeItem("selectedAddress");
        await new Promise(resolve => setTimeout(resolve, 800));
        setStep(2);
      } else {
        toast.error(res.data.message || "Lỗi tạo đơn hàng");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối Server");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán thành công (Bước 2 -> Success Page)
  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config?.baseUrl}/api/cart/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(resetCart());
      navigate(`/payment-success?order_id=${orderId}&payment_intent=${paymentIntentId}`);
    } catch (error) {
      console.error(error);
      dispatch(resetCart());
      navigate(`/payment-success?order_id=${orderId}&payment_intent=${paymentIntentId}`);
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] pb-20 font-bodyFont">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-[#0F172A] text-white pt-10 pb-24 overflow-hidden mb-[-60px]">
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         <Container>
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                  <span>/</span>
                  <Link to="/cart" className="hover:text-white transition-colors">Cart</Link>
                  <span>/</span>
                  <span className="text-accent">Checkout</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-titleFont mb-2">
                 Thanh Toán
               </h1>
               <p className="text-gray-400 text-sm">
                 Hoàn tất đơn hàng của bạn chỉ trong vài bước.
               </p>
            </div>
         </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-20">
            
            {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* STEP INDICATOR */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${step >= 1 ? "text-primary" : "text-gray-300"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>1</div>
                        <span className="font-bold hidden sm:block">Địa chỉ giao hàng</span>
                    </div>
                    <div className={`flex-1 h-[2px] mx-4 ${step >= 2 ? "bg-black" : "bg-gray-100"}`}></div>
                    <div className={`flex items-center gap-3 ${step >= 2 ? "text-primary" : "text-gray-300"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>2</div>
                        <span className="font-bold hidden sm:block">Thanh toán</span>
                    </div>
                </div>

                {/* STEP 1: FORM ĐỊA CHỈ */}
                {step === 1 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                    >
                        <h3 className="text-xl font-bold mb-6 text-primary">Thông tin người nhận</h3>
                        <form onSubmit={handleCreateOrder} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-secondary tracking-wider">Họ</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-3.5 text-gray-400" />
                                        <input name="firstName" value={address.firstName} onChange={handleAddressChange} placeholder="Nhập họ" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none transition-all bg-gray-50 focus:bg-white" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-secondary tracking-wider">Tên</label>
                                    <input name="lastName" value={address.lastName} onChange={handleAddressChange} placeholder="Nhập tên" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none transition-all bg-gray-50 focus:bg-white" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-secondary tracking-wider">Số điện thoại</label>
                                <div className="relative">
                                    <FaPhoneAlt className="absolute left-4 top-3.5 text-gray-400" />
                                    <input name="phone" value={address.phone} onChange={handleAddressChange} placeholder="VD: 0987..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none transition-all bg-gray-50 focus:bg-white" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-secondary tracking-wider">Địa chỉ chi tiết</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-4 top-3.5 text-gray-400" />
                                    <input name="street" value={address.street} onChange={handleAddressChange} placeholder="Số nhà, tên đường, phường/xã..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none transition-all bg-gray-50 focus:bg-white" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-secondary tracking-wider">Thành phố / Tỉnh</label>
                                    <div className="relative">
                                        <FaCity className="absolute left-4 top-3.5 text-gray-400" />
                                        <input name="city" value={address.city} onChange={handleAddressChange} placeholder="Hà Nội, TP.HCM..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none transition-all bg-gray-50 focus:bg-white" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-secondary tracking-wider">Quận / Huyện</label>
                                    <input name="state" value={address.state} onChange={handleAddressChange} placeholder="Quận..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none transition-all bg-gray-50 focus:bg-white" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button disabled={loading} type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {loading ? "Đang xử lý..." : <>Tiếp tục thanh toán <FaArrowRight /></>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* STEP 2: THANH TOÁN */}
                {step === 2 && orderId && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                    >
                        <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                            <FaCheckCircle className="text-green-500 mt-1 text-xl" />
                            <div>
                                <h4 className="font-bold text-green-800">Thông tin giao hàng đã được xác nhận!</h4>
                                <p className="text-sm text-green-700 mt-1">Mã đơn hàng tạm thời: #{orderId.slice(-6).toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><FaCreditCard /> Thẻ Tín Dụng / Ghi Nợ</h3>
                            <p className="text-secondary text-sm">Thanh toán an toàn qua cổng Stripe.</p>
                        </div>

                        <StripePayment 
                            orderId={orderId} 
                            amount={totalAmt}
                            onSuccess={handlePaymentSuccess}
                            onCancel={() => {
                                toast("Đã hủy thanh toán");
                                setStep(1);
                            }}
                        />
                    </motion.div>
                )}
            </div>

            {/* CỘT PHẢI: ORDER SUMMARY (STICKY) */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
                    <h2 className="text-lg font-bold text-primary mb-4 pb-4 border-b border-gray-100">Đơn hàng của bạn</h2>
                    
                    <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {products.map((item) => {
                            // 🔥 FIX LỖI ẢNH TẠI ĐÂY: Dò tìm mọi ngóc ngách
                            const imgSrc = item.image || item.images?.[0] || item.productId?.images?.[0] || "";

                            return (
                                <div key={item._id} className="flex gap-3 items-center group">
                                    <div className="w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <FaImage className="text-gray-300 text-lg" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate text-primary">{item.name}</p>
                                        <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                                    </div>
                                    <div className="text-sm font-bold text-primary">
                                        <PriceFormat amount={item.price * item.quantity} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-secondary">
                            <span>Tạm tính</span>
                            <span><PriceFormat amount={totalAmt} /></span>
                        </div>
                        <div className="flex justify-between text-sm text-secondary">
                            <span>Phí vận chuyển</span>
                            <span className="text-green-600 font-bold">Miễn phí</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                            <span className="font-bold text-lg text-primary">Tổng cộng</span>
                            <span className="font-extrabold text-2xl text-accent"><PriceFormat amount={totalAmt} /></span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </Container>
    </div>
  );
};

export default Checkout;