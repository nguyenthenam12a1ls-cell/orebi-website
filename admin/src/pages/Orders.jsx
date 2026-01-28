import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import SmallLoader from "../components/SmallLoader";
import PriceFormat from "../components/PriceFormat";
import { 
  FaSearch, FaFilter, FaEdit, FaTrash, FaSync, 
  FaCheckCircle, FaClock, FaTruck, FaBan, FaFileInvoice, FaTimes 
} from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal State
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Gọi API lấy tất cả đơn hàng
      const response = await fetch(`${serverUrl}/api/order/all-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverUrl}/api/order/update-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: editingOrder._id, status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Order status updated successfully!");
        fetchOrders();
        setEditingOrder(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async (id) => {
    if(!window.confirm("Delete this order? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverUrl}/api/order/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await response.json();
      if(data.success) {
        toast.success("Order deleted");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch(err) { toast.error("Error deleting order"); }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = order._id.includes(searchTerm) || order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered": return { bg: "bg-emerald-100", text: "text-emerald-700", icon: <FaCheckCircle/> };
      case "shipped": return { bg: "bg-blue-100", text: "text-blue-700", icon: <FaTruck/> };
      case "cancelled": return { bg: "bg-red-100", text: "text-red-700", icon: <FaBan/> };
      case "confirmed": return { bg: "bg-purple-100", text: "text-purple-700", icon: <FaCheckCircle/> };
      default: return { bg: "bg-amber-100", text: "text-amber-700", icon: <FaClock/> }; // Pending
    }
  };

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <FaFileInvoice />
              </span>
              Order Management
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-11">
              Track and update order status
            </p>
          </div>
          <button onClick={fetchOrders} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm">
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Order ID or Customer Name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
            />
          </div>
          <div className="relative min-w-[180px]">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none cursor-pointer capitalize text-sm font-medium text-gray-600"
            >
              {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><SmallLoader /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
               <FaFileInvoice className="mx-auto text-4xl mb-3 text-gray-300" />
               <p>No orders found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order Info</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredOrders.map(order => {
                    const statusStyle = getStatusStyle(order.status);
                    return (
                      <tr key={order._id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs text-gray-400 mb-1">#{order._id.slice(-6).toUpperCase()}</div>
                          <div className="font-semibold text-gray-900">{order.userId?.name || "Guest"}</div>
                          <div className="text-xs text-gray-500">{order.userId?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          <PriceFormat amount={order.amount} />
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs font-medium uppercase border ${order.payment ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                             {order.paymentMethod || "COD"}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusStyle.bg} ${statusStyle.text} border-transparent`}>
                            {statusStyle.icon} {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => { setEditingOrder(order); setNewStatus(order.status); }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => deleteOrder(order._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL UPDATE STATUS */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Update Status</h3>
                <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <p className="text-sm text-blue-800 mb-1">Order ID:</p>
                   <p className="font-mono font-bold text-lg text-blue-900">#{editingOrder._id.slice(-6).toUpperCase()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select New Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none capitalize bg-white"
                  >
                    {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setEditingOrder(null)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium disabled:opacity-70 transition-colors shadow-lg shadow-indigo-200"
                  >
                    {isUpdating ? "Saving..." : "Update Status"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Orders;