import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import SmallLoader from "../components/SmallLoader";
import PropTypes from "prop-types";
import { 
  FaWallet, FaShoppingCart, FaUserPlus, FaBoxOpen, 
  FaArrowUp, FaArrowDown, FaEllipsisH, FaRegClock
} from "react-icons/fa";
import { Link } from "react-router-dom";
import PriceFormat from "../components/PriceFormat";

// --- COMPONENT THẺ STATS (CARD) ---
const StatCard = ({ title, value, icon: Icon, colorFrom, colorTo, trend, loading }) => (
  <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    {/* Hiệu ứng nền Gradient mờ */}
    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${colorFrom} ${colorTo} opacity-[0.08] rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${colorFrom} ${colorTo} text-white shadow-lg shadow-blue-500/20`}>
        <Icon className="text-lg" />
      </div>
      {/* Trend Badge */}
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        {trend >= 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
        {Math.abs(trend)}%
      </div>
    </div>
    
    <div className="relative z-10">
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
      ) : (
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{value}</h3>
      )}
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string, value: PropTypes.any, icon: PropTypes.any,
  colorFrom: PropTypes.string, colorTo: PropTypes.string, trend: PropTypes.number, loading: PropTypes.bool
};

// --- TRANG HOME CHÍNH ---
const Home = ({ token }) => {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/dashboard/stats`, { 
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) setStats(response.data.stats);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchStats();
  }, [token]);

  return (
    <Container>
      <div className="space-y-8 animate-fade-in pb-10">
        
        {/* 1. HERO SECTION */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute bottom-0 right-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
             <FaWallet size={300} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
             <div>
               <h1 className="text-3xl font-bold mb-2">Welcome Back, Admin! 👋</h1>
               <p className="text-blue-100 text-sm max-w-md">
                 Here is your store's performance overview. You have some new orders to check today.
               </p>
             </div>
             <div className="flex gap-3">
                <Link to="/add" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-semibold transition-all border border-white/20 text-sm flex items-center gap-2">
                   <span>+</span> Product
                </Link>
                <Link to="/orders" className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-bold shadow-lg transition-all text-sm">
                   Manage Orders
                </Link>
             </div>
          </div>
        </div>

        {/* 2. STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={<PriceFormat amount={stats.totalRevenue} />} 
            icon={FaWallet} 
            colorFrom="from-blue-500" colorTo="to-blue-600" 
            trend={12.5} loading={loading}
          />
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={FaShoppingCart} 
            colorFrom="from-purple-500" colorTo="to-purple-600" 
            trend={8.2} loading={loading}
          />
          <StatCard 
            title="Products" 
            value={stats.totalProducts} 
            icon={FaBoxOpen} 
            colorFrom="from-orange-500" colorTo="to-orange-600" 
            trend={-2.4} loading={loading}
          />
          <StatCard 
            title="Customers" 
            value={stats.totalUsers} 
            icon={FaUserPlus} 
            colorFrom="from-emerald-500" colorTo="to-emerald-600" 
            trend={5.7} loading={loading}
          />
        </div>

        {/* 3. ANALYTICS & ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Chart Section (Simulated) */}
           <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[350px]">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="font-bold text-gray-800 text-lg">Revenue Overview</h3>
                    <p className="text-xs text-gray-400">Monthly earning performance</p>
                 </div>
                 <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><FaEllipsisH /></button>
              </div>
              
              <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2">
                  {[45, 70, 50, 85, 60, 95, 75, 55, 80, 65, 90, 100].map((h, i) => (
                    <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group cursor-pointer hover:bg-gradient-to-t hover:from-blue-500 hover:to-purple-500 transition-all duration-300" style={{height: `${h}%`}}>
                       {/* Tooltip */}
                       <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                         ${h * 100}
                       </div>
                    </div>
                  ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest border-t border-gray-100 pt-3">
                 <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
              </div>
           </div>

           {/* Quick Activity / Tips */}
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Recent Activity</h3>
              
              <div className="space-y-6">
                {[
                  { text: "New order #ORD-001 received", time: "2 min ago", color: "bg-blue-500" },
                  { text: "Server maintenance completed", time: "1 hour ago", color: "bg-green-500" },
                  { text: "Product 'Nike Shoes' updated", time: "3 hours ago", color: "bg-orange-500" },
                  { text: "Weekly report generated", time: "5 hours ago", color: "bg-purple-500" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {/* Timeline Line */}
                    {idx !== 3 && <div className="absolute left-[5px] top-6 w-[2px] h-full bg-gray-100"></div>}
                    
                    <div className={`w-3 h-3 rounded-full ${item.color} mt-1.5 flex-shrink-0 ring-4 ring-white`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.text}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <FaRegClock size={10} /> {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center">
                   <p className="font-bold text-sm mb-1">🔥 Pro Tip</p>
                   <p className="text-xs text-gray-400">Check your inventory daily to avoid stockouts.</p>
                </div>
              </div>
           </div>
        </div>

      </div>
    </Container>
  );
};

Home.propTypes = { token: PropTypes.string };
export default Home;