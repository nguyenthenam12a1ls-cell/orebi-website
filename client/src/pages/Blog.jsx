import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { FaUser, FaCalendarAlt, FaTag, FaSearch, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const Blog = () => {
  // Dữ liệu bài viết giả lập (Mock Data)
  const blogPosts = [
    {
      id: 1,
      title: "7 Cách phối đồ Minimalist cho mùa hè năng động",
      excerpt: "Phong cách tối giản (Minimalism) chưa bao giờ lỗi thời. Hãy cùng Orebi khám phá những công thức phối đồ đơn giản nhưng cực chất...",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
      author: "Admin",
      date: "12 Oct, 2025",
      category: "Fashion",
      tags: ["Minimalist", "Summer", "Style"]
    },
    {
      id: 2,
      title: "Review chi tiết: Tai nghe chống ồn Sony WH-1000XM5",
      excerpt: "Liệu siêu phẩm mới nhất nhà Sony có xứng đáng với mức giá? Cùng đi sâu vào phân tích chất âm, khả năng chống ồn và thời lượng pin...",
      image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop",
      author: "Tech Reviewer",
      date: "05 Nov, 2025",
      category: "Electronics",
      tags: ["Sony", "Audio", "Review"]
    },
    {
      id: 3,
      title: "Xu hướng nội thất 2025: Khi thiên nhiên hòa quyện",
      excerpt: "Không gian sống xanh đang là xu hướng chủ đạo. Những món đồ nội thất gỗ, cây xanh và ánh sáng tự nhiên sẽ lên ngôi trong năm tới...",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=1000&auto=format&fit=crop",
      author: "Sarah Design",
      date: "20 Nov, 2025",
      category: "Home Decor",
      tags: ["Interior", "Green", "Living"]
    }
  ];

  const recentPosts = [
    { title: "Top 10 phụ kiện du lịch", date: "10 Oct, 2025" },
    { title: "Cách bảo quản giày Sneaker", date: "02 Oct, 2025" },
    { title: "Quà tặng công nghệ cho nam", date: "28 Sep, 2025" },
  ];

  const categories = ["Fashion", "Electronics", "Home Decor", "Lifestyle", "Travel"];
  const tags = ["Apple", "Samsung", "Nike", "Summer", "Vintage", "Decor", "Tips"];

  return (
    <div className="w-full bg-white pb-20">
      {/* Page Header */}
      <div className="bg-bgLight py-10 mb-10 border-b border-gray-100">
        <Container>
          <h1 className="text-4xl font-titleFont font-bold text-primary mb-2">Blog & Tin Tức</h1>
          <p className="text-secondary text-sm">
            <Link to="/" className="hover:text-accent duration-300">Home</Link> / <span>Blog</span>
          </p>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* === CỘT TRÁI: DANH SÁCH BÀI VIẾT (8 phần) === */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {blogPosts.map((post) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                key={post.id} 
                className="group flex flex-col gap-4"
              >
                {/* Image Container */}
                <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden relative cursor-pointer shadow-sm">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-md">
                    {post.category}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-secondary font-medium uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-accent" /> {post.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUser className="text-accent" /> {post.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaTag className="text-accent" /> {post.tags.join(", ")}
                  </div>
                </div>

                {/* Title & Excerpt */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3 cursor-pointer group-hover:text-accent transition-colors leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-secondary leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <button className="flex items-center gap-2 text-primary font-bold hover:text-accent transition-colors underline underline-offset-4 decoration-2 decoration-accent/30 hover:decoration-accent">
                    Đọc tiếp <FaArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Pagination Mockup */}
            <div className="flex gap-2 mt-8">
              <button className="w-10 h-10 rounded-lg bg-primary text-white font-bold">1</button>
              <button className="w-10 h-10 rounded-lg border border-gray-200 hover:bg-gray-50 text-secondary">2</button>
              <button className="w-10 h-10 rounded-lg border border-gray-200 hover:bg-gray-50 text-secondary">3</button>
            </div>
          </div>

          {/* === CỘT PHẢI: SIDEBAR (4 phần) === */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            
            {/* Search Box */}
            <div className="bg-bgLight p-6 rounded-2xl">
              <h3 className="font-bold text-lg text-primary mb-4">Tìm kiếm</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Tìm bài viết..." 
                  className="w-full p-3 pl-4 pr-10 rounded-xl border border-gray-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg text-primary mb-6 relative inline-block">
                Danh mục
                <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-accent rounded-full"></span>
              </h3>
              <ul className="flex flex-col gap-3">
                {categories.map((cat, idx) => (
                  <li key={idx} className="flex justify-between items-center text-secondary hover:text-accent cursor-pointer transition-colors border-b border-gray-100 pb-2 last:border-0">
                    <span>{cat}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{(idx + 1) * 3}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Posts */}
            <div>
              <h3 className="font-bold text-lg text-primary mb-6 relative inline-block">
                Bài viết mới
                <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-accent rounded-full"></span>
              </h3>
              <div className="flex flex-col gap-4">
                {recentPosts.map((post, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <h4 className="font-bold text-primary text-sm group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <span className="text-xs text-gray-400 mt-1 block">{post.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Cloud */}
            <div>
              <h3 className="font-bold text-lg text-primary mb-6 relative inline-block">
                Tags
                <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-accent rounded-full"></span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-gray-100 text-xs text-secondary rounded-full hover:bg-accent hover:text-white cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
};

export default Blog;