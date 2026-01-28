import React from "react";

const Price = ({ onPriceSelect }) => {
  const priceList = [
    {
      _id: 950,
      priceOne: 0,
      priceTwo: 50,
    },
    {
      _id: 951,
      priceOne: 50,
      priceTwo: 100,
    },
    {
      _id: 952,
      priceOne: 100,
      priceTwo: 200,
    },
    {
      _id: 953,
      priceOne: 200,
      priceTwo: 500,
    },
    {
      _id: 954,
      priceOne: 500,
      priceTwo: 10000,
    },
  ];

  const handlePriceClick = (min, max) => {
    // Gửi min, max lên component cha
    if (onPriceSelect) {
      onPriceSelect(min, max);
    }
  };

  return (
    <div className="w-full">
      <h3 className="font-bold text-xl mb-4 text-primary font-titleFont">Shop by Price</h3>
      <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
        {/* Nút Reset - Tất cả mức giá */}
        <li
          onClick={() => handlePriceClick("", "")}
          className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 hover:text-accent hover:border-gray-400 duration-300 cursor-pointer group"
        >
          <span className="w-3 h-3 border border-gray-400 rounded-full group-hover:bg-accent group-hover:border-accent"></span>
          All Prices
        </li>

        {/* Danh sách khoảng giá */}
        {priceList.map((item) => (
          <li
            key={item._id}
            onClick={() => handlePriceClick(item.priceOne, item.priceTwo)}
            className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center gap-2 hover:text-accent hover:border-gray-400 duration-300 cursor-pointer group"
          >
            <span className="w-3 h-3 border border-gray-400 rounded-full group-hover:bg-accent group-hover:border-accent"></span>
            ${item.priceOne} - ${item.priceTwo}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Price;