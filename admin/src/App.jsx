import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Home from "./pages/Home";
import ScrollToTop from "./components/ScrollToTop";
import Users from "./pages/Users";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Analytics from "./pages/Analytics";
import Inventory from "./pages/Inventory";
import Invoice from "./pages/Invoice";
import Categories from "./pages/Categories";
import Brands from "./pages/Brands";
import ApiDocumentation from "./pages/ApiDocumentation";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";

function App() {
  // Lấy token từ Redux, nếu null thì gán chuỗi rỗng để tránh crash propTypes
  const { token } = useSelector((state) => state.auth);
  const safeToken = token || ""; 

  return (
    <main className="bg-gray-50 min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                
                <div className="flex w-full flex-1">
                  {/* Sidebar cố định chiều cao bằng màn hình để hiện thanh cuộn */}
                  <div className="w-16 sm:w-64 lg:w-72 fixed h-screen border-r-2 z-10 bg-[#111827] left-0 top-0 pt-16 md:pt-0">
                    <Sidebar />
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 px-3 sm:px-5 py-6 ml-16 sm:ml-64 lg:ml-72 bg-gray-50 h-full min-h-screen">
                    <ScrollToTop />
                    <Routes>
                      {/* Truyền safeToken vào các component */}
                      <Route path="/" element={<Home token={safeToken} />} />
                      
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/add" element={<Add token={safeToken} />} />
                      <Route path="/list" element={<List token={safeToken} />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/brands" element={<Brands />} />
                      <Route path="/orders" element={<Orders token={safeToken} />} />
                      <Route path="/invoice" element={<Invoice />} />
                      <Route path="/users" element={<Users token={safeToken} />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/api-docs" element={<ApiDocumentation />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </main>
  );
}

export default App;