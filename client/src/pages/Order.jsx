import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import PriceFormat from "../components/PriceFormat";
import { motion } from "framer-motion";
import axios from "axios";
import { config } from "../../config";
import { FaBoxOpen, FaClock, FaCheckCircle, FaTruck, FaTimesCircle, FaEye, FaShoppingBag, FaCreditCard } from "react-icons/fa";

const Order = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      try {
        const response = await axios.get(`${config?.baseUrl}/api/order/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        }
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const renderStatus = (status) => {
    const statusConfig = {
      pending: { color: "text-yellow-600 bg-yellow-50 border-yellow-100", icon: <FaClock /> },
      confirmed: { color: "text-blue-600 bg-blue-50 border-blue-100", icon: <FaCheckCircle /> },
      shipped: { color: "text-purple-600 bg-purple-50 border-purple-100", icon: <FaTruck /> },
      delivered: { color: "text-green-600 bg-green-50 border-green-100", icon: <FaCheckCircle /> },
      cancelled: { color: "text-red-600 bg-red-50 border-red-100", icon: <FaTimesCircle /> },
    };

    const config = statusConfig[status] || { color: "text-gray-600 bg-gray-50 border-gray-100", icon: null };

    return (
      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase border ${config.color}`}>
        {config.icon} {status}
      </span>
    );
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-bodyFont">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-[#0F172A] text-white pt-20 pb-40 overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
         
         <Container>
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                  <Link to="/" className="hover:text-white transition-colors">Home</Link>
                  <span>/</span>
                  <span className="text-accent">Orders</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Lịch sử đơn hàng</h1>
               <p className="text-gray-400 text-lg">Theo dõi và quản lý các đơn hàng bạn đã mua.</p>
            </div>
         </Container>
      </div>

      {/* 2. FLOATING CONTENT */}
      <Container className="-mt-24 relative z-20">
        
        {loading ? (
           <div className="flex justify-center py-20 bg-white rounded-3xl shadow-lg min-h-[400px] items-center">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
           </div>
        ) : orders.length === 0 ? (
           // EMPTY STATE
           <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="bg-white rounded-3xl shadow-2xl p-10 text-center flex flex-col items-center min-h-[400px] justify-center"
           >
              <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                 <FaBoxOpen className="text-6xl text-gray-300 opacity-50" />
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Chưa có đơn hàng nào</h2>
              <p className="text-secondary mb-8">Hãy bắt đầu mua sắm để lấp đầy lịch sử đơn hàng của bạn nhé!</p>
              <Link to="/shop">
                 <button className="bg-primary text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                    Khám Phá Ngay
                 </button>
              </Link>
           </motion.div>
        ) : (
           // ORDERS LIST
           <div className="flex flex-col gap-6">
              {orders.map((order, index) => (
                 <motion.div 
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                 >
                    {/* Order Header */}
                    <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-6 bg-white relative">
                       <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       
                       <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                          <div>
                             <p className="text-xs text-secondary uppercase tracking-wider font-bold mb-1">Mã đơn hàng</p>
                             <div className="flex items-center gap-2">
                                <FaShoppingBag className="text-accent" />
                                <span className="font-mono text-lg font-bold text-primary">#{order._id.slice(-8).toUpperCase()}</span>
                             </div>
                          </div>
                          
                          <div>
                             <p className="text-xs text-secondary uppercase tracking-wider font-bold mb-1">Ngày đặt</p>
                             <span className="text-primary font-medium">{new Date(order.createdAt || order.date).toLocaleDateString("vi-VN")}</span>
                          </div>

                          <div>
                             <p className="text-xs text-secondary uppercase tracking-wider font-bold mb-1">Tổng tiền</p>
                             <span className="text-primary font-extrabold text-lg"><PriceFormat amount={order.amount} /></span>
                          </div>
                       </div>

                       <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          {/* 🔥 NÚT THANH TOÁN (Chỉ hiện khi chưa trả tiền và không phải COD) */}
                          {order.paymentStatus === 'pending' && order.paymentMethod === 'stripe' && (
                             <button 
                                onClick={() => navigate(`/payment/${order._id}`)}
                                className="flex items-center gap-2 text-sm font-bold text-white bg-primary hover:bg-accent transition-all px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                             >
                                <FaCreditCard /> Thanh toán ngay
                             </button>
                          )}

                          {renderStatus(order.status)}
                          
                          <Link to={`/order/${order._id}`}>
                             <button className="flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors bg-gray-50 hover:bg-white border border-gray-200 hover:border-accent px-5 py-2.5 rounded-xl shadow-sm">
                                <FaEye /> Chi tiết
                             </button>
                          </Link>
                       </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-6 md:p-8 bg-gray-50/30">
                       <div className="flex flex-col gap-4">
                          {order.items.slice(0, 2).map((item, idx) => (
                             <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                   <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      className="w-full h-full object-contain p-1"
                                   />
                                </div>
                                <div className="flex-1">
                                   <h4 className="text-sm font-bold text-primary line-clamp-1">{item.name}</h4>
                                   <div className="flex items-center gap-3 mt-1">
                                      <span className="text-xs font-bold text-secondary bg-gray-100 px-2 py-0.5 rounded">x{item.quantity}</span>
                                      <span className="text-xs font-bold text-primary"><PriceFormat amount={item.price} /></span>
                                   </div>
                                </div>
                             </div>
                          ))}
                          {order.items.length > 2 && (
                             <div className="text-center mt-2">
                                <span className="text-xs font-bold text-secondary italic">+ {order.items.length - 2} sản phẩm khác</span>
                             </div>
                          )}
                       </div>
                    </div>
                 </motion.div>
              ))}
           </div>
        )}
      </Container>
    </div>
  );
};

export default Order;