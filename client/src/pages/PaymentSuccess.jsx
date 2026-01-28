import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Container from "../components/Container";
import PriceFormat from "../components/PriceFormat";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaShoppingBag,
  FaHome,
  FaListAlt,
  FaPrint,
  FaShare,
  FaTruck,
  FaCalendarAlt,
  FaBoxOpen,
  FaEnvelope
} from "react-icons/fa";
import toast from "react-hot-toast";
import { config } from "../../config"; // Đảm bảo import config

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("order_id");
  const paymentIntentId = searchParams.get("payment_intent");

  useEffect(() => {
    const confirmPaymentAndFetchOrder = async () => {
      if (!orderId || !paymentIntentId) {
        toast.error("Thông tin thanh toán không hợp lệ");
        navigate("/orders");
        return;
      }

      try {
        const token = localStorage.getItem("token");

        // Confirm payment with backend
        const confirmResponse = await fetch(
          `${config?.baseUrl}/api/payment/stripe/confirm-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              paymentIntentId,
              orderId,
            }),
          }
        );

        const confirmData = await confirmResponse.json();
        if (confirmData.success) {
          setOrder(confirmData.order);
          toast.success("Xác nhận thanh toán thành công!");
        } else {
          toast.error(confirmData.message || "Xác nhận thanh toán thất bại");
          navigate("/orders");
        }
      } catch (error) {
        console.error("Payment confirmation error:", error);
        toast.error("Lỗi kết nối khi xác nhận thanh toán");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    confirmPaymentAndFetchOrder();
  }, [orderId, paymentIntentId, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Đơn hàng Orebi - ${order._id}`,
          text: `Tôi vừa đặt hàng thành công đơn hàng trị giá $${order.amount}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-bodyFont">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary font-medium">Đang xác nhận giao dịch...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-bodyFont">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2 font-titleFont">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-secondary mb-6">
            Có lỗi xảy ra khi truy xuất thông tin. Vui lòng liên hệ hỗ trợ.
          </p>
          <Link
            to="/orders"
            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-all shadow-lg"
          >
            Về danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-bodyFont">
      
      {/* 1. HERO SECTION (Giống Contact/About) */}
      <div className="relative bg-[#0F172A] text-white pt-20 pb-32 md:pb-48 overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
         
         <Container>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 text-center space-y-6"
            >
               <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl"
               >
                  <FaCheckCircle className="w-14 h-14 text-green-500" />
               </motion.div>
               
               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-titleFont">
                 Thanh toán thành công!
               </h1>
               <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                 Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
               </p>
               <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-sm font-mono text-accent">
                  Mã đơn: #{order._id.slice(-8).toUpperCase()}
               </div>
            </motion.div>
         </Container>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <Container className="-mt-24 relative z-20">
        <div className="max-w-5xl mx-auto">
          
          {/* Quick Actions Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Link to="/" className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2">
               <FaHome className="text-2xl text-secondary group-hover:text-accent transition-colors" />
               <span className="text-sm font-bold text-primary">Trang chủ</span>
            </Link>
            <Link to="/shop" className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2">
               <FaShoppingBag className="text-2xl text-secondary group-hover:text-accent transition-colors" />
               <span className="text-sm font-bold text-primary">Tiếp tục mua</span>
            </Link>
            <Link to="/orders" className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2">
               <FaListAlt className="text-2xl text-secondary group-hover:text-accent transition-colors" />
               <span className="text-sm font-bold text-primary">Đơn hàng</span>
            </Link>
            <button onClick={handlePrint} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col items-center justify-center gap-2">
               <FaPrint className="text-2xl text-secondary group-hover:text-accent transition-colors" />
               <span className="text-sm font-bold text-primary">In hóa đơn</span>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: DETAILS */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.5 }}
               className="lg:col-span-2 space-y-6"
            >
              {/* Payment Status Card */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                   <FaBoxOpen className="text-accent" /> Chi tiết trạng thái
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                         <FaCheckCircle />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wider">Thanh toán</div>
                        <div className="text-lg font-bold text-green-900">THÀNH CÔNG</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                         <FaTruck />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Vận chuyển</div>
                        <div className="text-lg font-bold text-blue-900">ĐANG XỬ LÝ</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-sm text-secondary font-medium">
                   <FaCalendarAlt />
                   <span>Thời gian thanh toán: {new Date().toLocaleString('vi-VN')}</span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-primary">Sản phẩm đã mua ({order.items.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-20 h-20 bg-white rounded-xl border border-gray-100 p-2 flex-shrink-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-primary truncate">{item.name}</h3>
                        <p className="text-sm text-secondary mt-1">Số lượng: <span className="font-bold text-primary">{item.quantity}</span></p>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-extrabold text-primary">
                          <PriceFormat amount={item.price * item.quantity} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-primary mb-6">Bước tiếp theo</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10">1</div>
                       <div className="w-0.5 h-full bg-gray-200 -my-2"></div>
                    </div>
                    <div className="pb-6">
                       <h4 className="font-bold text-primary">Xác nhận đơn hàng</h4>
                       <p className="text-sm text-secondary mt-1">Hệ thống đã gửi email xác nhận đến hộp thư của bạn.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className="w-8 h-8 bg-white border-2 border-accent text-accent rounded-full flex items-center justify-center font-bold text-sm z-10">2</div>
                       <div className="w-0.5 h-full bg-gray-200 -my-2"></div>
                    </div>
                    <div className="pb-6">
                       <h4 className="font-bold text-primary">Đóng gói & Vận chuyển</h4>
                       <p className="text-sm text-secondary mt-1">Đơn hàng sẽ được bàn giao cho đơn vị vận chuyển trong 24h tới.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm z-10">3</div>
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-400">Giao hàng thành công</h4>
                       <p className="text-sm text-gray-400 mt-1">Bạn sẽ nhận được hàng sau 2-4 ngày làm việc.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: SUMMARY (Sticky) */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.6 }}
               className="lg:col-span-1"
            >
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-primary mb-6 pb-4 border-b border-gray-100">
                  Tổng quan đơn hàng
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary font-medium">Tạm tính</span>
                    <span className="font-bold text-primary"><PriceFormat amount={order.amount} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary font-medium">Vận chuyển</span>
                    <span className="font-bold text-green-600">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary font-medium">Thuế (VAT)</span>
                    <span className="font-bold text-primary">$0.00</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-primary text-base">Tổng thanh toán</span>
                    <span className="font-extrabold text-2xl text-accent">
                      <PriceFormat amount={order.amount} />
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 text-primary py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm border border-gray-200"
                  >
                    <FaShare /> Chia sẻ đơn hàng
                  </button>

                  <Link
                    to="/shop"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl hover:bg-black transition-all font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    <FaShoppingBag /> Tiếp tục mua sắm
                  </Link>
                </div>
                
                <div className="mt-6 text-center">
                   <p className="text-xs text-gray-400">
                      Cần hỗ trợ? <Link to="/contact" className="text-accent hover:underline">Liên hệ ngay</Link>
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
      
      {/* 3. DIAGRAM TRIGGER (Payment Process Visualization) */}
      
    </div>
  );
};

export default PaymentSuccess;