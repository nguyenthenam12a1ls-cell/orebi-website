import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { config } from "../../config";
import Container from "../components/Container";
import PriceFormat from "../components/PriceFormat";
import { FaArrowLeft, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaBoxOpen, FaCreditCard } from "react-icons/fa";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${config?.baseUrl}/api/order/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getPaymentMethodName = (method) => {
    if (method === "stripe") return "Thẻ tín dụng quốc tế";
    if (method === "cod") return "Thanh toán khi nhận hàng";
    return method;
  };

  const getPaymentStatusName = (status) => {
      if (status === "paid") return "Đã thanh toán";
      if (status === "pending") return "Chờ thanh toán";
      return status;
  }

  const getOrderStatusName = (status) => {
      const map = {
          pending: "Chờ xử lý",
          confirmed: "Đã xác nhận",
          shipped: "Đang giao",
          delivered: "Đã giao",
          cancelled: "Đã hủy"
      };
      return map[status] || status;
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
    </div>
  );
  
  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-bold">Không tìm thấy đơn hàng</h2>
      <Link to="/orders" className="text-blue-500 hover:underline">Quay lại danh sách</Link>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-bodyFont">
      <div className="bg-white border-b border-gray-200 py-4 mb-8">
        <Container>
            <div className="flex items-center gap-4">
                <Link to="/orders" className="text-secondary hover:text-primary transition-colors flex items-center gap-2 font-bold text-sm uppercase">
                    <FaArrowLeft /> Quay lại
                </Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <h1 className="text-xl font-bold text-primary">Chi tiết đơn hàng <span className="font-mono text-gray-500">#{order._id.slice(-6).toUpperCase()}</span></h1>
            </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột Trái: Thông tin sản phẩm */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-lg text-primary flex items-center gap-2">
                            <FaBoxOpen className="text-accent" /> Sản phẩm ({order.items.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {order.items.map((item, index) => (
                            <div key={index} className="p-6 flex gap-4 items-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 p-2 flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-primary line-clamp-2">{item.name}</h3>
                                    <p className="text-sm text-secondary mt-1">Số lượng: <span className="font-bold text-primary">{item.quantity}</span></p>
                                </div>
                                <div className="font-bold text-primary text-lg">
                                    <PriceFormat amount={item.price * item.quantity} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-gray-50/50 flex justify-between items-center border-t border-gray-100">
                        <span className="font-bold text-secondary">Tổng tiền thanh toán</span>
                        <span className="font-extrabold text-2xl text-accent"><PriceFormat amount={order.amount} /></span>
                    </div>
                </div>
            </div>

            {/* Cột Phải: Thông tin giao hàng */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-primary mb-4 border-b border-gray-100 pb-2">Thông tin nhận hàng</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className="text-accent mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-sm text-primary mb-1">{order.address.firstName} {order.address.lastName}</p>
                                <p className="text-sm text-secondary leading-relaxed">
                                    {order.address.street}, {order.address.city}<br/>
                                    {order.address.state}, {order.address.country}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaPhoneAlt className="text-accent flex-shrink-0" />
                            <p className="text-sm font-bold text-primary">{order.address.phone}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaEnvelope className="text-accent flex-shrink-0" />
                            <p className="text-sm font-medium text-secondary break-all">{order.address.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-lg text-primary mb-4 border-b border-gray-100 pb-2">Trạng thái đơn hàng</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary">Tình trạng:</span>
                            <span className="font-bold text-primary capitalize px-3 py-1 bg-gray-100 rounded-full text-xs border border-gray-200">
                                {getOrderStatusName(order.status)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary">Thanh toán:</span>
                            <span className={`font-bold capitalize px-3 py-1 rounded-full text-xs border ${
                                order.paymentStatus === 'paid' 
                                ? 'bg-green-50 text-green-600 border-green-100' 
                                : 'bg-orange-50 text-orange-500 border-orange-100'
                            }`}>
                                {getPaymentStatusName(order.paymentStatus)}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary">Phương thức:</span>
                            <span className="font-bold text-primary text-sm text-right max-w-[150px]">
                                {getPaymentMethodName(order.paymentMethod)}
                            </span>
                        </div>

                        {/* 🔥 NÚT THANH TOÁN (Chỉ hiện khi chưa trả tiền và không phải COD) */}
                        {order.paymentStatus === 'pending' && order.paymentMethod === 'stripe' && (
                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => window.location.href = `/payment/${order._id}`}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-accent transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <FaCreditCard /> Thanh toán ngay (<PriceFormat amount={order.amount} />)
                                </button>
                                <p className="text-xs text-center text-red-500 mt-2">
                                    Đơn hàng chưa được thanh toán. Vui lòng hoàn tất để chúng tôi xử lý.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </Container>
    </div>
  );
};

export default OrderDetails;