import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import Title from "../components/ui/title";
import SmallLoader from "../components/SmallLoader";
import PriceFormat from "../components/PriceFormat";
import { 
  FaFileCsv, 
  FaDownload, 
  FaChartBar, 
  FaBoxOpen, 
  FaUserFriends,
  FaSync
} from "react-icons/fa";
import toast from "react-hot-toast";

const Reports = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sales"); // sales | inventory | customers
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  // 1. Fetch All Data Needed for Reports
  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Gọi song song 3 API để lấy toàn bộ dữ liệu
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get(`${serverUrl}/api/order/all-orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${serverUrl}/api/products`),
        axios.get(`${serverUrl}/api/user/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
      if (productsRes.data.success) setProducts(productsRes.data.products);
      if (usersRes.data.success) setUsers(usersRes.data.users);

    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // 2. Export to CSV Logic
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    // Lấy headers từ keys của object đầu tiên
    const headers = Object.keys(data[0]);
    
    // Tạo nội dung CSV
    const csvContent = [
      headers.join(","), // Hàng tiêu đề
      ...data.map(row => headers.map(fieldName => {
        // Xử lý dữ liệu để tránh lỗi CSV (ví dụ: chuỗi có dấu phẩy)
        let value = row[fieldName];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(","))
    ].join("\n");

    // Tạo blob và link tải xuống
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Prepare Data for Views
  const getSalesData = () => {
    return orders.map(order => ({
      "Order ID": order._id,
      "Date": new Date(order.date).toLocaleDateString(),
      "Customer": order.userId?.name || "Guest",
      "Email": order.userId?.email || "N/A",
      "Amount": order.amount,
      "Status": order.status,
      "Payment": order.paymentMethod
    }));
  };

  const getInventoryData = () => {
    return products.map(p => ({
      "Product Name": p.name,
      "Category": p.category,
      "Brand": p.brand,
      "Price": p.price,
      "Stock": p.stock,
      "Sold": p.soldQuantity || 0,
      "Revenue Generated": (p.soldQuantity || 0) * p.price
    }));
  };

  const getCustomerData = () => {
    return users.map(u => ({
      "Name": u.name,
      "Email": u.email,
      "Role": u.role,
      "Status": u.isActive ? "Active" : "Inactive",
      "Join Date": new Date(u.createdAt).toLocaleDateString()
    }));
  };

  // 4. Handle Export Button Click
  const handleExport = () => {
    if (activeTab === "sales") downloadCSV(getSalesData(), "Sales_Report");
    if (activeTab === "inventory") downloadCSV(getInventoryData(), "Inventory_Report");
    if (activeTab === "customers") downloadCSV(getCustomerData(), "Customer_Report");
  };

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Title className="flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
              Reports Center
            </Title>
            <p className="text-gray-600 mt-1">
              Generate and export detailed business reports
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchReportData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <FaFileCsv />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "sales" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaChartBar /> Sales & Revenue
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "inventory" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaBoxOpen /> Inventory Status
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "customers" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaUserFriends /> Customers
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64"><SmallLoader /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase">
                  <tr>
                    {activeTab === "sales" && (
                      <>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Amount</th>
                      </>
                    )}
                    {activeTab === "inventory" && (
                      <>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4 text-right">Stock</th>
                        <th className="p-4 text-right">Price</th>
                        <th className="p-4 text-right">Est. Revenue</th>
                      </>
                    )}
                    {activeTab === "customers" && (
                      <>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Join Date</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {activeTab === "sales" && orders.slice(0, 50).map(order => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="p-4">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="p-4">{order.userId?.name || "Guest"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold"><PriceFormat amount={order.amount} /></td>
                    </tr>
                  ))}

                  {activeTab === "inventory" && products.slice(0, 50).map(product => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4">{product.category}</td>
                      <td className={`p-4 text-right ${product.stock < 10 ? "text-red-600 font-bold" : ""}`}>
                        {product.stock}
                      </td>
                      <td className="p-4 text-right"><PriceFormat amount={product.price} /></td>
                      <td className="p-4 text-right text-gray-500">
                        <PriceFormat amount={(product.soldQuantity || 0) * product.price} />
                      </td>
                    </tr>
                  ))}

                  {activeTab === "customers" && users.slice(0, 50).map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4 capitalize">{user.role}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Footer Note */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
                Displaying the latest 50 records for preview. Use the <strong>Export CSV</strong> button to download the full dataset.
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Reports;