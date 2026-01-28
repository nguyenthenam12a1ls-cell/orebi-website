import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../../config";
import { 
  FaEdit, FaTrash, FaSearch, FaPlus, FaBoxOpen, 
  FaSync, FaFilter, FaLayerGroup 
} from "react-icons/fa";
import { Link } from "react-router-dom";
import PriceFormat from "../components/PriceFormat";
import Container from "../components/Container";
import PropTypes from "prop-types";
import SmallLoader from "../components/SmallLoader";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchList = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách sản phẩm
      const response = await axios.get(serverUrl + "/api/products");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        // Fallback nếu API trả về lỗi hoặc dùng đường dẫn khác
        const retryRes = await axios.get(serverUrl + "/api/product");
        if(retryRes.data.success) setList(retryRes.data.products);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (id) => {
    if(!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await axios.post(serverUrl + "/api/products/remove", { _id: id }, { headers: { token } });
      if (response.data.success) {
        toast.success("Product deleted successfully");
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error deleting product");
    }
  };

  useEffect(() => { fetchList(); }, []);

  // Filter Logic
  const filteredList = list.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(list.map(p => p.category))];

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        
        {/* 1. HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <FaBoxOpen />
              </span>
              Product Inventory
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-11">
              Manage your catalog ({filteredList.length} items)
            </p>
          </div>
          
          <Link 
            to="/add" 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 font-medium"
          >
            <FaPlus /> Add Product
          </Link>
        </div>

        {/* 2. TOOLBAR (SEARCH & FILTER) */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none transition-all text-sm" 
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex gap-2">
            <div className="relative min-w-[160px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLayerGroup className="text-gray-400 text-xs" />
              </div>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none appearance-none cursor-pointer capitalize text-sm font-medium text-gray-600"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
              <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>
            
            <button 
              onClick={fetchList} 
              className="px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-xl transition-colors"
              title="Refresh List"
            >
              <FaSync className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* 3. PRODUCT TABLE */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex justify-center"><SmallLoader /></div>
          ) : filteredList.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBoxOpen className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Product Info</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-center">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredList.map(item => (
                    <tr key={item._id} className="group hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 p-0.5 shadow-sm overflow-hidden flex-shrink-0">
                            <img 
                              src={item.images[0]} 
                              className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform duration-300" 
                              alt={item.name} 
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{item.name}</p>
                            <p className="text-xs text-gray-500">ID: {item._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize border border-gray-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-bold text-gray-700">
                        <PriceFormat amount={item.price} />
                      </td>
                      <td className="px-6 py-3 text-center">
                        {item.stock > 0 ? (
                           <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">
                             {item.stock} in stock
                           </span>
                        ) : (
                           <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded text-xs border border-red-100">
                             Out of stock
                           </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* Nút Edit (Placeholder) */}
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            <FaEdit />
                          </button>
                          {/* Nút Xóa */}
                          <button 
                            onClick={() => handleRemoveProduct(item._id)} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
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

List.propTypes = { token: PropTypes.string };
export default List;