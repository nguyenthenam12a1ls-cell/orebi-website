import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../../config";
import Container from "../components/Container";
import SmallLoader from "../components/SmallLoader";
import { 
  FaUsers, FaSearch, FaUserShield, FaUser, 
  FaTrash, FaSync, FaEnvelope, FaCircle 
} from "react-icons/fa";

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách user
      const response = await axios.get(serverUrl + "/api/user/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRemoveUser = async (id) => {
    if(!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      const response = await axios.delete(`${serverUrl}/api/user/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(response.data.success) {
        toast.success("User removed");
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch(err) { toast.error("Error removing user"); }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <div className="space-y-6 animate-fade-in">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <FaUsers />
              </span>
              User Management
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-11">
              Manage system users and customers ({filteredUsers.length})
            </p>
          </div>
          <button onClick={fetchUsers} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-all shadow-sm">
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email address..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><SmallLoader /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
               <FaUsers className="mx-auto text-4xl mb-3 text-gray-300" />
               <p>No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* Avatar Gradient */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white">
                            {user.avatar ? (
                                <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                            ) : user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FaEnvelope size={10} /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wide">
                            <FaUserShield size={10} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <FaUser size={10} /> Customer
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           {/* Status Indicator */}
                           <FaCircle size={8} className={user.isActive !== false ? "text-green-500" : "text-gray-300"} />
                           <span className={`text-xs font-medium ${user.isActive !== false ? 'text-gray-700' : 'text-gray-400'}`}>
                             {user.isActive !== false ? "Active" : "Inactive"}
                           </span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleRemoveUser(user._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove User"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Users;