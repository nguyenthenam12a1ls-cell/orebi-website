import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IoMdCloudUpload, IoMdCheckmark, IoMdArrowBack } from "react-icons/io";
import { FaTag, FaLayerGroup, FaDollarSign, FaBoxes, FaCheckCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../../config";
import Container from "../components/Container";

const Add = ({ token }) => {
  const [isLoading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "", description: "", brand: "", price: "",
    discountedPercentage: 0, stock: "", category: "", 
    offer: false, isAvailable: true, _type: ""
  });
  
  const [imageFiles, setImageFiles] = useState({ 
    image1: null, image2: null, image3: null, image4: null 
  });
  
  const [previews, setPreviews] = useState({
    image1: "", image2: "", image3: "", image4: ""
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
              fetch(`${serverUrl}/api/category`),
              fetch(`${serverUrl}/api/brand`)
            ]);
            const catData = await catRes.json();
            const brandData = await brandRes.json();
            if(catData.success) setCategories(catData.categories);
            if(brandData.success) setBrands(brandData.brands);
        } catch(err) { console.log(err); }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if(file) {
      setImageFiles(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleUploadProduct = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.price || !formData.category || !imageFiles.image1) {
      toast.error("Please fill required fields and upload at least 1 image");
      return;
    }

    try {
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        Object.keys(imageFiles).forEach(key => {
            if(imageFiles[key]) data.append(key, imageFiles[key]);
        });

        // Gọi API thêm sản phẩm
        const response = await axios.post(serverUrl + "/api/products/add", data, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if(response.data.success) {
            toast.success("Product published successfully!");
            navigate("/list");
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        toast.error("Error adding product");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container>
      <form onSubmit={handleUploadProduct} className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
             <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
             <p className="text-gray-500 text-sm">Fill in the details to add a product to inventory.</p>
          </div>
          <div className="flex gap-3">
             <Link to="/list" className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
               <IoMdArrowBack /> Cancel
             </Link>
             <button 
               type="submit" 
               disabled={isLoading}
               className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-black flex items-center gap-2 disabled:opacity-70 transition-all shadow-lg shadow-gray-900/20"
             >
               {isLoading ? "Saving..." : <><IoMdCheckmark /> Publish Product</>}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: MAIN INFO */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
               <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 mb-2">General Information</h3>
               
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                 <input 
                   type="text" name="name" value={formData.name} onChange={handleChange} 
                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
                   placeholder="e.g., Nike Air Max 90"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                 <textarea 
                   name="description" rows="5" value={formData.description} onChange={handleChange}
                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none placeholder:text-gray-400"
                   placeholder="Describe your product features, material, and care instructions..."
                 ></textarea>
               </div>
            </div>

            {/* Pricing & Stock Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
               <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 mb-2">Pricing & Inventory</h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base Price <span className="text-red-500">*</span></label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                       <FaDollarSign />
                     </div>
                     <input 
                       type="number" name="price" value={formData.price} onChange={handleChange}
                       className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                       placeholder="0.00"
                     />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount %</label>
                   <input 
                     type="number" name="discountedPercentage" value={formData.discountedPercentage} onChange={handleChange}
                     className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                     placeholder="0"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Quantity <span className="text-red-500">*</span></label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                       <FaBoxes />
                     </div>
                     <input 
                       type="number" name="stock" value={formData.stock} onChange={handleChange}
                       className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                       placeholder="100"
                     />
                   </div>
                 </div>
                 <div className="flex flex-col justify-center gap-3">
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <input type="checkbox" name="offer" checked={formData.offer} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                      <span className="text-sm font-medium text-gray-700">Put on Sale</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                      <span className="text-sm font-medium text-gray-700">Mark as Active</span>
                    </label>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: MEDIA & ORG */}
          <div className="space-y-6">
             {/* Media Card */}
             <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Product Images</h3>
                <div className="grid grid-cols-2 gap-3">
                   {['image1','image2','image3','image4'].map((key, i) => (
                      <div key={key} className={`col-span-${i===0 ? '2' : '1'} relative aspect-square`}>
                         <label className={`w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group
                            ${previews[key] ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
                            
                            {previews[key] ? (
                               <img src={previews[key]} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                               <>
                                 <IoMdCloudUpload className="text-2xl text-gray-400 group-hover:text-blue-500 mb-1 transition-colors" />
                                 <span className="text-[10px] text-gray-500 group-hover:text-blue-600 font-medium">Upload {i+1}</span>
                               </>
                            )}
                            <input type="file" hidden onChange={(e) => handleImageChange(e, key)} accept="image/*" />
                         </label>
                         
                         {previews[key] && (
                           <div className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors" onClick={(e) => {
                             e.preventDefault();
                             setImageFiles(p => ({...p, [key]: null}));
                             setPreviews(p => ({...p, [key]: ""}));
                           }}>
                             <IoMdCheckmark className="text-green-500" />
                           </div>
                         )}
                      </div>
                   ))}
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                   Primary image is the large one. Upload up to 4 images.
                </p>
             </div>

             {/* Organization Card */}
             <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 mb-2">Category & Brand</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5"><FaLayerGroup className="inline mr-1.5 text-xs text-gray-400"/> Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                     <option value="">Select Category</option>
                     {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5"><FaTag className="inline mr-1.5 text-xs text-gray-400"/> Brand</label>
                  <select name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                     <option value="">Select Brand</option>
                     {brands.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                
                <div className="pt-2">
                   <p className="text-xs text-gray-500 mb-2">Product Collection</p>
                   <div className="flex flex-wrap gap-2">
                      {["Best Sellers", "New Arrivals", "Featured"].map((type) => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => setFormData(p => ({...p, _type: type.toLowerCase().replace(" ", "_")}))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            formData._type === type.toLowerCase().replace(" ", "_") 
                            ? 'bg-blue-100 border-blue-200 text-blue-700 font-bold' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>

        </div>
      </form>
    </Container>
  );
};

Add.propTypes = { token: PropTypes.string };
export default Add;