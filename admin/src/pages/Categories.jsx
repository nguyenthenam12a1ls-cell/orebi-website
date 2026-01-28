import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Container from "../components/Container";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSync,
  FaLayerGroup,
  FaImage,
} from "react-icons/fa";
import { IoMdClose, IoMdCloudUpload } from "react-icons/io";

const Categories = () => {
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- Modal & Form State ---
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- API LOGIC (Giữ nguyên logic cũ của bạn) ---
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      // Đảm bảo dùng đúng biến môi trường VITE_BACKEND_URL
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Category name is required");
    // Nếu đang tạo mới thì bắt buộc có ảnh
    if (!formData.image && !editingCategory) return toast.error("Category image is required");

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("description", formData.description.trim());
      if (formData.image) formDataToSend.append("image", formData.image);

      const url = editingCategory
        ? `${import.meta.env.VITE_BACKEND_URL}/api/category/${editingCategory._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/category`;

      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingCategory ? "Updated successfully" : "Created successfully");
        fetchCategories();
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure? Deleting a category might affect associated products.")) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/${categoryId}`, // Lưu ý: thêm /api nếu backend cần
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        toast.success("Deleted successfully");
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // --- Modal Handlers ---
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || "", image: null });
      setImagePreview(category.image);
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "", image: null });
      setImagePreview("");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", image: null });
    setImagePreview("");
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <div className="space-y-6 animate-fade-in pb-10">
        
        {/* 1. HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                <FaLayerGroup />
              </span>
              Categories
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">Manage product categories ({categories.length})</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchCategories} 
              className="px-4 py-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
              title="Refresh"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={() => openModal()} 
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 font-medium transform hover:-translate-y-0.5"
            >
              <FaPlus /> Add Category
            </button>
          </div>
        </div>

        {/* 2. SEARCH BAR */}
        <div className="relative">
           <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search categories by name..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
           />
        </div>

        {/* 3. GRID VIEW (Replacing the old Table) */}
        {loading ? (
          // Loading Skeletons
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white h-56 rounded-2xl shadow-sm border border-gray-100 animate-pulse p-4">
                <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          // Empty State
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLayerGroup className="text-4xl text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
            <p className="text-gray-500 mt-1">Start by creating your first category.</p>
          </div>
        ) : (
          // Data Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
            {filteredCategories.map((cat) => (
              <div key={cat._id} className="group relative bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                
                {/* Image Area with Hover Overlay */}
                <div className="relative h-40 w-full rounded-xl overflow-hidden mb-4 bg-gray-100">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FaImage size={40} />
                    </div>
                  )}
                  
                  {/* Actions Overlay (Visible on hover) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button onClick={() => openModal(cat)} className="p-2.5 bg-white text-blue-600 rounded-xl hover:scale-110 transition-transform shadow-lg" title="Edit">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="p-2.5 bg-white text-red-600 rounded-xl hover:scale-110 transition-transform shadow-lg" title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 truncate px-2">{cat.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[2.5em] px-2">
                    {cat.description || "No description available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. MODERN MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div 
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingCategory ? "Edit Category" : "New Category"}
                </h3>
                <button onClick={closeModal} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shadow-sm">
                  <IoMdClose size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-gray-400"
                    placeholder="e.g. Electronics"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-400"
                    placeholder="Short description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image {editingCategory ? "" : <span className="text-red-500">*</span>}</label>
                  
                  <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all group overflow-hidden relative ${imagePreview ? 'border-blue-400 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <IoMdCloudUpload className="text-3xl text-blue-600 mb-1" />
                           <span className="text-sm text-blue-700 font-bold">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <IoMdCloudUpload className="text-4xl mb-2" />
                        <p className="text-sm font-medium mb-1">Click to upload</p>
                        <p className="text-xs text-gray-400 group-hover:text-blue-400">SVG, PNG, JPG (MAX. 2MB)</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold disabled:opacity-70 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : editingCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Categories;