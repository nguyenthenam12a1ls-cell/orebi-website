import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const initialState = {
  userInfo: null,
  products: [],
  wishlist: [], // Khởi tạo mảng rỗng
  orderCount: 0,
};

export const orebiSlice = createSlice({
  name: "orebi",
  initialState,
  reducers: {
    // --- USER ---
    addUser: (state, action) => {
      state.userInfo = action.payload;
    },
    removeUser: (state) => {
      state.userInfo = null;
      state.orderCount = 0;
      state.wishlist = []; // Xóa wishlist khi đăng xuất
    },
    setOrderCount: (state, action) => {
      state.orderCount = action.payload;
    },
    resetOrderCount: (state) => {
      state.orderCount = 0;
    },

    // --- PRODUCTS & CART ---
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    addToCart: (state, action) => {
      const item = state.products.find((item) => item._id === action.payload._id);
      if (item) {
        item.quantity += action.payload.quantity;
      } else {
        state.products.push(action.payload);
      }
    },

    increaseQuantity: (state, action) => {
      const item = state.products.find((item) => item._id === action.payload);
      if (item) item.quantity++;
    },

    decreaseQuantity: (state, action) => {
      const item = state.products.find((item) => item._id === action.payload);
      if (item && item.quantity > 1) item.quantity--;
    },

    deleteItem: (state, action) => {
      state.products = state.products.filter((item) => item._id !== action.payload);
    },
    
    resetCart: (state) => {
      state.products = [];
    },

    // --- WISHLIST (ĐÃ SỬA LỖI) ---
    toggleWishlist: (state, action) => {
      // 🔥 FIX QUAN TRỌNG: Kiểm tra nếu wishlist bị undefined do cache cũ thì tạo mới
      if (!Array.isArray(state.wishlist)) {
        state.wishlist = [];
      }

      const itemIndex = state.wishlist.findIndex((item) => item._id === action.payload._id);
      
      if (itemIndex >= 0) {
        // Nếu đã có -> Xóa
        state.wishlist.splice(itemIndex, 1);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        // Nếu chưa có -> Thêm
        state.wishlist.push(action.payload);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    },
  },
});

export const {
  addUser,
  removeUser,
  setOrderCount,
  resetOrderCount,
  setProducts,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  deleteItem,
  resetCart,
  toggleWishlist, 
} = orebiSlice.actions;

export default orebiSlice.reducer;