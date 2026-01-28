import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom"; // 🔥 1. Thêm useLocation
import { useDispatch } from "react-redux";
import axios from "axios";
import { config } from "../../config";
import { setProducts, removeUser } from "../redux/orebiSlice";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTopButton from "./ScrollToTop"; // Đổi tên để tránh nhầm lẫn với logic cuộn trang
import { Toaster, toast } from "react-hot-toast";

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 2. Lấy thông tin đường dẫn hiện tại

  // --- 🔥 3. LOGIC MỚI: TỰ ĐỘNG CUỘN LÊN ĐẦU TRANG KHI CHUYỂN TRANG ---
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Cuộn mượt (hoặc bỏ dòng này nếu muốn nhảy ngay lập tức)
    });
  }, [location.pathname]); // Chạy mỗi khi đường dẫn thay đổi
  // --------------------------------------------------------------------

  // --- CƠ CHẾ TỰ ĐỘNG ĐĂNG XUẤT KHI TOKEN HẾT HẠN (GIỮ NGUYÊN) ---
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          dispatch(removeUser());
          localStorage.removeItem("token");
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          navigate("/signin");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch, navigate]);

  // --- GỌI API LẤY SẢN PHẨM (GIỮ NGUYÊN) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${config?.baseUrl}/api/products`);
        if (response.data.success) {
          dispatch(setProducts(response.data.products));
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu sản phẩm:", error);
      }
    };
    fetchProducts();
  }, [dispatch]);

  return (
    <div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { background: '#333', color: '#fff' },
        }}
      />
      <Header />
      <ScrollToTopButton /> {/* Nút mũi tên góc phải */}
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;