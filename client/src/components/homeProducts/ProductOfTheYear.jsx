import { Link } from "react-router-dom";
import { productOfTheYear } from "../../assets/images";
import { Button } from "../ui/button";

const ProductOfTheYear = () => {
  return (
    <Link to="/shop" className="group block mb-20 w-full">
      <div className="w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 md:bg-transparent relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
        
        {/* HÌNH ẢNH (Giữ nguyên vị trí bạn đã duyệt) */}
        <img
          src={productOfTheYear}
          alt="productImage"
          className="w-full h-full object-cover hidden md:inline-block group-hover:scale-110 translate-x-12 scale-105 transition-transform duration-700 ease-out"
        />

        {/* NỘI DUNG */}
        <div className="w-full md:w-2/3 xl:w-1/2 h-96 absolute px-6 md:px-8 top-0 right-0 flex flex-col items-start justify-center gap-8 bg-gradient-to-r md:bg-gradient-to-l from-white/95 via-white/90 to-transparent backdrop-blur-sm">
          
          <div className="space-y-4">
            {/* --- ĐÃ SỬA: Thêm khung bo tròn cho Limited Edition --- */}
            <span className="inline-block px-4 py-1.5 bg-white border border-gray-200 text-blue-600 text-[11px] font-bold tracking-widest uppercase rounded-full shadow-sm mb-2">
              Limited Edition
            </span>

            {/* Tiêu đề */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary leading-[1.1]">
              Sản Phẩm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Của Năm
              </span>
            </h1>

            {/* Mô tả */}
            <p className="text-base md:text-lg font-medium text-gray-600 max-w-[500px] leading-relaxed">
              Khám phá sự kết hợp hoàn hảo giữa công nghệ và thời trang. Đã chinh phục hàng triệu trái tim, nay sẵn sàng để bạn trải nghiệm.
            </p>
          </div>

          {/* Nút bấm */}
          <Button className="px-8 py-4 text-lg font-semibold bg-black hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300">
            Mua Ngay
          </Button>

        </div>
      </div>
    </Link>
  );
};

export default ProductOfTheYear;