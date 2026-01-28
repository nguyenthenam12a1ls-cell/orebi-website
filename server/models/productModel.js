import mongoose from "mongoose";

// Schema cho từng bài đánh giá
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    avatar: { type: String }, // Lưu avatar người đánh giá
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    _type: { type: String },
    name: { type: String, required: true },
    images: { type: Array, required: true },
    price: { type: Number, required: true },
    discountedPercentage: { type: Number, required: true, default: 10 },
    stock: { type: Number, required: true, default: 0 },
    soldQuantity: { type: Number, default: 0 },
    category: { type: String, required: true },
    brand: { type: String },
    badge: { type: Boolean },
    isAvailable: { type: Boolean },
    offer: { type: Boolean },
    description: { type: String, required: true },
    tags: { type: Array },
    reviews: [reviewSchema], 
    rating: { type: Number, required: true, default: 0 }, // Điểm trung bình
    numReviews: { type: Number, required: true, default: 0 }, // Số lượng đánh giá
  },
  {
    timestamps: true,
  }
);
const productModel = mongoose.models.product || mongoose.model("product", productSchema);
export default productModel;