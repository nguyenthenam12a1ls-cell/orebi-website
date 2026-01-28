import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Container from "../components/Container";
import StripePayment from "../components/StripePayment";
import { config } from "../../config";
import axios from "axios";
import { FaLock, FaShieldAlt, FaCreditCard, FaBoxOpen, FaMapMarkerAlt, FaImage } from "react-icons/fa";
import PriceFormat from "../components/PriceFormat";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        const res = await axios.get(`${config?.baseUrl}/api/order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.data.success) {
          const fetchedOrder = res.data.order;
          
          if (fetchedOrder.paymentStatus === "paid") {
             toast.success("Đơn hàng này đã được thanh toán!");
             navigate(`/order/${id}`);
             return;
          }
          
          if (fetchedOrder.paymentMethod === "cod") {
              toast.error("Đơn hàng này thanh toán khi nhận hàng (COD)");
              navigate(`/order/${id}`);
              return;
          }

          setOrder(fetchedOrder);
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
        toast.error("Không tìm thấy thông tin đơn hàng");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handlePaymentSuccess = (paymentIntentId) => {
      navigate(`/payment-success?order_id=${id}&payment_intent=${paymentIntentId}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return null;

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
                  <Link to="/orders" className="hover:text-white transition-colors">Orders</Link>
                  <span>/</span>
                  <span className="text-accent">Payment</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-titleFont mb-2">
                 Thanh Toán Đơn Hàng
               </h1>
               <p className="text-gray-400 text-sm flex items-center gap-2">
                 <FaShieldAlt className="text-green-500" /> Thanh toán an toàn & bảo mật
               </p>
            </div>
         </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-20">
            
            {/* CỘT TRÁI: CHI TIẾT ĐƠN HÀNG */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2 space-y-6"
            >
                {/* Thông tin đơn hàng */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <FaBoxOpen className="text-accent" /> Chi tiết đơn hàng <span className="text-gray-400 font-mono text-sm ml-auto">#{order._id.slice(-6).toUpperCase()}</span>
                    </h3>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {order.items.map((item, index) => {
                            // 🔥 LOGIC FIX ẢNH: Kiểm tra nhiều nguồn để lấy ảnh đúng nhất
                            const imgSrc = item.image || item.productId?.images?.[0] || item.images?.[0] || "";
                            
                            return (
                                <div key={index} className="flex gap-4 items-center group">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 p-1 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <FaImage className="text-gray-300 text-xl" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-primary text-sm line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-secondary mt-1">Số lượng: <span className="font-bold">{item.quantity}</span></p>
                                    </div>
                                    <div className="text-sm font-bold text-primary">
                                        <PriceFormat amount={item.price * item.quantity} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Thông tin giao hàng */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <FaMapMarkerAlt className="text-accent" /> Giao tới
                    </h3>
                    <div className="text-sm text-secondary space-y-1 pl-2 border-l-2 border-gray-100">
                        <p className="font-bold text-primary text-base">{order.address.firstName} {order.address.lastName}</p>
                        <p className="flex items-center gap-2 text-gray-500"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">SĐT</span> {order.address.phone}</p>
                        <p className="mt-2 text-gray-600">{order.address.street}, {order.address.city}</p>
                        <p className="text-gray-600">{order.address.state}, {order.address.country}</p>
                    </div>
                </div>
            </motion.div>

            {/* CỘT PHẢI: FORM THANH TOÁN */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-1"
            >
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
                    <div className="bg-[#0F172A] p-6 text-white text-center">
                        <h2 className="text-xl font-bold mb-1">
                            Xác nhận thanh toán
                        </h2>
                        <p className="text-white/60 text-xs font-mono">Đơn hàng #{order._id.slice(-6).toUpperCase()}</p>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100 bg-gray-50 -mx-6 px-6 py-4 mt-[-24px]">
                            <span className="text-gray-600 font-medium text-sm">Tổng tiền thanh toán</span>
                            <span className="text-2xl font-extrabold text-primary">
                                <PriceFormat amount={order.amount} />
                            </span>
                        </div>

                        {/* Form Stripe */}
                        <div className="mt-4">
                            <StripePayment 
                                orderId={order._id} 
                                amount={order.amount}
                                onSuccess={handlePaymentSuccess} 
                                onCancel={() => navigate("/orders")}
                            />
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                            <FaLock size={10} /> Được bảo mật bởi Stripe & SSL 256-bit.
                        </p>
                    </div>
                </div>
            </motion.div>

        </div>
      </Container>
    </div>
  );
};

export default Payment;