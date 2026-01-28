import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import Title from "../components/ui/title";
import SmallLoader from "../components/SmallLoader";
import PriceFormat from "../components/PriceFormat";
import { 
  FaFileInvoice, 
  FaPrint, 
  FaSearch, 
  FaEye, 
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from "react-icons/fa";
import toast from "react-hot-toast";

const Invoice = () => {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Ref cho phần in ấn
  const invoiceRef = useRef();

  // 1. Fetch Orders (Dùng làm dữ liệu hóa đơn)
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${serverUrl}/api/order/all-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        // Chỉ lấy các đơn hàng đã xác nhận hoặc hoàn thành để xuất hóa đơn
        const validOrders = response.data.orders.filter(order => order.status !== 'cancelled');
        setOrders(validOrders);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // 2. Filter Logic
  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.userId?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.userId?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Print Function
  const handlePrint = () => {
    const printContent = invoiceRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    // Tạo view in tạm thời
    document.body.innerHTML = printContent;
    window.print();
    
    // Khôi phục lại trang web sau khi in
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload để đảm bảo JS chạy lại đúng (React state)
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1"><FaCheckCircle/> Paid</span>;
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold flex items-center gap-1"><FaClock/> Pending</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold capitalize">{status}</span>;
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Title className="flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              Invoice List
            </Title>
            <p className="text-gray-600 mt-1">
              View and print invoices for customer orders
            </p>
          </div>
        </div>

        {/* Stats & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <FaSearch className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search invoice by ID, name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-gray-700"
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between text-blue-800">
            <span className="font-medium">Total Invoices</span>
            <span className="text-2xl font-bold">{filteredOrders.length}</span>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><SmallLoader /></div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No invoices found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="p-4 font-semibold">Invoice #</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Customer</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Payment</th>
                    <th className="p-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-blue-600 font-medium">
                        #INV-{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.address?.firstName} {order.address?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{order.userId?.email}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        <PriceFormat amount={order.amount} />
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.paymentStatus || "pending")}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedInvoice(order)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2 ml-auto"
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* INVOICE MODAL (Hidden by default, shown when selected) */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8 relative flex flex-col max-h-[90vh]">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h3 className="font-bold text-lg text-gray-800">Invoice Details</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPrint /> Print
                  </button>
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* PRINTABLE AREA */}
              <div className="p-8 overflow-y-auto" ref={invoiceRef}>
                {/* Header */}
                <div className="flex justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                    <p className="text-gray-500 font-mono">#INV-{selectedInvoice._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">Orebi Store</h2>
                    <p className="text-gray-500 text-sm">123 E-commerce St.<br/>Digital City, 10001<br/>support@orebi.com</p>
                  </div>
                </div>

                {/* Bill To & Info */}
                <div className="flex justify-between mb-8 bg-gray-50 p-6 rounded-lg">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Bill To</h4>
                    <p className="font-bold text-gray-900 text-lg">
                      {selectedInvoice.address?.firstName} {selectedInvoice.address?.lastName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {selectedInvoice.address?.street}<br/>
                      {selectedInvoice.address?.city}, {selectedInvoice.address?.country}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">{selectedInvoice.address?.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase block">Date</span>
                      <span className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Payment Method</span>
                      <span className="font-medium uppercase">{selectedInvoice.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 text-sm font-bold text-gray-600 uppercase">Description</th>
                      <th className="text-center py-3 text-sm font-bold text-gray-600 uppercase">Qty</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Price</th>
                      <th className="text-right py-3 text-sm font-bold text-gray-600 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4">
                          <p className="font-bold text-gray-800">{item.name}</p>
                          {item.size && <span className="text-xs text-gray-500">Size: {item.size}</span>}
                        </td>
                        <td className="py-4 text-center">{item.quantity}</td>
                        <td className="py-4 text-right">
                          <PriceFormat amount={item.price} />
                        </td>
                        <td className="py-4 text-right font-medium">
                          <PriceFormat amount={item.price * item.quantity} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <PriceFormat amount={selectedInvoice.amount} />
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (0%)</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-gray-900 pt-2 text-xl font-bold text-gray-900 mt-4">
                      <span>Total</span>
                      <PriceFormat amount={selectedInvoice.amount} />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
                  <p>Thank you for your business!</p>
                  <p className="mt-1 text-xs">If you have any questions about this invoice, please contact support.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Invoice;