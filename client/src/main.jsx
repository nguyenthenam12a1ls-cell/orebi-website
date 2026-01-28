import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import "slick-carousel/slick/slick.css";
import "./styles/index.css"; 

// Import Layout
import Layout from "./components/Layout";

// Import Pages
import App from "./App";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog"; 
import Cart from "./pages/Cart";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Checkout from "./pages/Checkout";
import Order from "./pages/Order";
import Profile from "./pages/Profile";
import SingleProduct from "./pages/SingleProduct";
import PageNotFound from "./pages/NotFound"; 
import Offers from "./pages/Offers";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";
import Product from "./pages/Product";
import Payment from "./pages/Payment";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";   
import EmailVerification from "./pages/EmailVerification"; // <--- 1. Import trang xác thực

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* 1. LAYOUT CHÍNH */}
      <Route path="/" element={<Layout />}>
        <Route index element={<App />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/journal" element={<Blog />} /> 
        <Route path="/offers" element={<Offers />} />
        <Route path="/product" element={<Product />} />
        
        {/* Product & Cart */}
        <Route path="/product/:id" element={<SingleProduct />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/:id" element={<Payment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        
        <Route path="/wishlist" element={<Wishlist />} />

        {/* User Protected Routes */}
        <Route path="/orders" element={<Order />} />
        <Route path="/order/:id" element={<OrderDetails />} /> 
        <Route path="/profile" element={<Profile />} />
        
        {/* 404 Not Found */}
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* 2. LAYOUT RIÊNG CHO AUTH */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* 🔥 3. CÁC ROUTE QUÊN MẬT KHẨU */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/email-verification" element={<EmailVerification />} /> {/* <--- Route mới */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
);