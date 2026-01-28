import { useState } from "react";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import { 
  FaServer, FaLock, FaGlobe, FaCopy, FaCheck, 
  FaCode, FaCube, FaShoppingCart, FaUsers 
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import toast from "react-hot-toast";

const ApiDocumentation = () => {
  const [copied, setCopied] = useState("");

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast.success("Endpoint copied!");
    setTimeout(() => setCopied(""), 2000);
  };

  // Định nghĩa danh sách API thật của hệ thống
  const apiGroups = [
    {
      title: "Authentication",
      icon: <FaUsers />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      endpoints: [
        { method: "POST", url: "/api/user/login", desc: "User/Admin login", auth: false },
        { method: "POST", url: "/api/user/register", desc: "Register new account", auth: false },
        { method: "GET", url: "/api/user/profile", desc: "Get current user profile", auth: true },
        { method: "PUT", url: "/api/user/profile", desc: "Update profile info", auth: true },
      ]
    },
    {
      title: "Products Management",
      icon: <FaCube />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      endpoints: [
        { method: "GET", url: "/api/products", desc: "Get all products list", auth: false },
        { method: "GET", url: "/api/products/{id}", desc: "Get single product details", auth: false },
        { method: "POST", url: "/api/products/add", desc: "Create new product", auth: true },
        { method: "POST", url: "/api/products/remove", desc: "Delete a product", auth: true },
        { method: "PUT", url: "/api/products/update/{id}", desc: "Update product info", auth: true },
      ]
    },
    {
      title: "Orders & Checkout",
      icon: <FaShoppingCart />,
      color: "text-green-600",
      bg: "bg-green-50",
      endpoints: [
        { method: "POST", url: "/api/order/create", desc: "Place a new order", auth: true },
        { method: "GET", url: "/api/order/my-orders", desc: "Get customer order history", auth: true },
        { method: "GET", url: "/api/order/all-orders", desc: "Get all orders (Admin)", auth: true },
        { method: "PUT", url: "/api/order/update-status", desc: "Update order status", auth: true },
        { method: "DELETE", url: "/api/order/delete", desc: "Delete an order", auth: true },
      ]
    },
    {
      title: "System & Stats",
      icon: <MdDashboard />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      endpoints: [
        { method: "GET", url: "/api/dashboard/stats", desc: "Get dashboard analytics", auth: true },
        { method: "GET", url: "/api/category", desc: "Get all categories", auth: false },
        { method: "GET", url: "/api/brand", desc: "Get all brands", auth: false },
      ]
    }
  ];

  const getMethodStyle = (method) => {
    switch (method) {
      case "GET": return "bg-blue-100 text-blue-700 border-blue-200";
      case "POST": return "bg-green-100 text-green-700 border-green-200";
      case "PUT": return "bg-orange-100 text-orange-700 border-orange-200";
      case "DELETE": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Container>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaServer className="text-blue-600" />
              API Reference
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Documentation for Orebi E-commerce REST API.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <FaGlobe className="text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Base URL:</span>
            <code className="font-mono text-sm text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
              {serverUrl}
            </code>
          </div>
        </div>

        {/* API Groups */}
        <div className="grid gap-8">
          {apiGroups.map((group, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Group Header */}
              <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${group.bg}`}>
                <span className={`text-xl ${group.color}`}>{group.icon}</span>
                <h3 className={`text-lg font-bold ${group.color}`}>{group.title}</h3>
              </div>

              {/* Endpoints List */}
              <div className="divide-y divide-gray-50">
                {group.endpoints.map((ep, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                      
                      {/* Method & URL */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border w-20 text-center flex-shrink-0 ${getMethodStyle(ep.method)}`}>
                          {ep.method}
                        </span>
                        <div className="flex items-center gap-2 min-w-0 font-mono text-sm text-gray-700">
                          <span className="truncate">{ep.url}</span>
                          <button 
                            onClick={() => handleCopy(ep.url)}
                            className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                            title="Copy URL"
                          >
                            {copied === ep.url ? <FaCheck className="text-green-500" /> : <FaCopy />}
                          </button>
                        </div>
                      </div>

                      {/* Description & Auth */}
                      <div className="flex items-center gap-6 justify-between md:justify-end flex-shrink-0">
                        <span className="text-sm text-gray-500 font-medium">{ep.desc}</span>
                        {ep.auth ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100">
                            <FaLock size={10} /> Auth
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-600 border border-green-100">
                            <FaGlobe size={10} /> Public
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
           <FaCode className="text-blue-500 mt-1" />
           <div>
             <h4 className="text-sm font-bold text-blue-800">Developer Note</h4>
             <p className="text-xs text-blue-600 mt-1">
               All "Auth" endpoints require a Bearer Token in the header: <code className="bg-white px-1 py-0.5 rounded border border-blue-200">Authorization: Bearer &lt;your_token&gt;</code>.
             </p>
           </div>
        </div>
      </div>
    </Container>
  );
};

export default ApiDocumentation;