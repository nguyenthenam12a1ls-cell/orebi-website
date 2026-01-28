/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        container: "1440px",
      },
      screens: {
        xs: "320px",
        sm: "375px",
        sml: "500px",
        md: "667px",
        mdl: "768px",
        lg: "960px",
        lgl: "1024px",
        xl: "1280px",
      },
      fontFamily: {
        bodyFont: ["Plus Jakarta Sans", "sans-serif"],
        titleFont: ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        // Màu chủ đạo mới: Xanh đen đậm (Sang trọng)
        primary: "#0F172A", 
        // Màu phụ: Xám trung tính
        secondary: "#64748B", 
        // Màu nhấn: Xanh dương hiện đại (Dùng cho nút bấm, hover)
        accent: "#3B82F6", 
        // Màu nền sáng
        bgLight: "#F8FAFC", 
        // Màu trắng tinh
        white: "#FFFFFF",
        // Màu đỏ báo lỗi/giảm giá
        destructive: "#EF4444",
      },
      boxShadow: {
        // Đổ bóng mềm mại hiện đại
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        hover: "0 10px 25px -5px rgba(59, 130, 246, 0.15)", // Bóng màu xanh khi hover
      }, 
    },
  },
  plugins: [],
};