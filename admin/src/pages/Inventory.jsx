import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import Title from "../components/ui/title";
import SmallLoader from "../components/SmallLoader";
import PriceFormat from "../components/PriceFormat";
import { 
  FaBoxes, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSearch,
  FaSync,
  FaSortAmountDown,
  FaFilter
} from "react-icons/fa";
import { MdOutlineInventory } from "react-icons/md";

const Inventory = () => {
  const { token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, low, out

  // 1. Fetch Products Data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Gọi API lấy toàn bộ sản phẩm để tính toán tồn kho
      const response = await axios.get(`${serverUrl}/api/products`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 2. Calculate Statistics (Real-time)
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);

    return { totalItems, totalStock, lowStockItems, outOfStockItems, totalValue };
  }, [products]);

  // 3. Filter Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "low") return matchesSearch && product.stock > 0 && product.stock <= 10;
    if (filterType === "out") return matchesSearch && product.stock === 0;
    if (filterType === "in") return matchesSearch && product.stock > 10;
    
    return matchesSearch;
  });

  // Sort by stock ascending (lowest stock first)
  const sortedProducts = [...filteredProducts].sort((a, b) => a.stock - b.stock);

  return (
    <Container>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Title className="flex items-center gap-2">
              <MdOutlineInventory className="text-blue-600" />
              Inventory Management
            </Title>
            <p className="text-gray-600 mt-1">
              Track stock levels and inventory value
            </p>
          </div>
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalItems}</h3>
                <p className="text-xs text-gray-400 mt-1">Total Stock: {stats.totalStock}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <FaBoxes size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Low Stock Alert</p>
                <h3 className="text-2xl font-bold text-yellow-600 mt-1">{stats.lowStockItems}</h3>
                <p className="text-xs text-gray-400 mt-1">Items with &le; 10 qty</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                <FaExclamationTriangle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStockItems}</h3>
                <p className="text-xs text-gray-400 mt-1">Needs restock</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-red-600">
                <FaTimesCircle size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">Inventory Value</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">
                  <PriceFormat amount={stats.totalValue} />
                </h3>
                <p className="text-xs text-gray-400 mt-1">Estimated asset value</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <FaCheckCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search product name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button 
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === "all" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              All Items
            </button>
            <button 
              onClick={() => setFilterType("low")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === "low" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Low Stock
            </button>
            <button 
              onClick={() => setFilterType("out")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === "out" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Out of Stock
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><SmallLoader /></div>
          ) : sortedProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FaBoxes className="mx-auto text-4xl mb-3 text-gray-300" />
              <p>No inventory items found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="p-4 font-semibold">Product Name</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold text-right">Price</th>
                    <th className="p-4 font-semibold text-center">Status</th>
                    <th className="p-4 font-semibold text-right">Stock Level</th>
                    <th className="p-4 font-semibold text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] && (
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-10 h-10 rounded object-cover border border-gray-200"
                            />
                          )}
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">{product.category}</td>
                      <td className="p-4 text-right font-medium">
                        <PriceFormat amount={product.price} />
                      </td>
                      <td className="p-4 text-center">
                        {product.stock === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : product.stock <= 10 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-bold ${product.stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.stock}
                          </span>
                          <span className="text-xs text-gray-400">units</span>
                        </div>
                        {/* Visual Bar */}
                        <div className="w-24 ml-auto h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              product.stock === 0 ? 'bg-gray-200' : 
                              product.stock <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-gray-700">
                        <PriceFormat amount={product.price * product.stock} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Inventory;