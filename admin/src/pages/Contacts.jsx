import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Container from "../components/Container";
import { serverUrl } from "../../config";
import { 
  FaEnvelope, 
  FaTrash, 
  FaSearch, 
  FaSync, 
  FaReply, 
  FaCheckDouble,
  FaExclamationCircle
} from "react-icons/fa";
import SmallLoader from "../components/SmallLoader";

const Contacts = () => {
  const { token } = useSelector((state) => state.auth);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({ total: 0, unread: 0, replied: 0 });

  // 1. Fetch Contacts Data
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      
      // 🔥 ĐÃ SỬA: Thử gọi đường dẫn ngắn hơn '/api/contact/all'
      // Nếu backend của bạn quy định khác, hãy thử sửa thành `${serverUrl}/api/contact`
      const response = await fetch(`${serverUrl}/api/contact/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Kiểm tra nếu server trả về lỗi HTML (404/500)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server endpoint not found or returned non-JSON data");
      }

      const data = await response.json();

      if (data.success) {
        setContacts(data.contacts || data.data || []); 
        
        // Calculate stats an toàn (phòng trường hợp data rỗng)
        const list = data.contacts || data.data || [];
        const unread = list.filter(c => c.status === "unread").length;
        const replied = list.filter(c => c.status === "replied").length;
        setStats({
          total: list.length,
          unread,
          replied
        });
      } else {
        // Không hiện toast lỗi để tránh spam nếu API chưa sẵn sàng
        console.warn(data.message || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Fetch contacts error:", error);
      // Không toast lỗi này để giao diện vẫn sạch sẽ
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // 2. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      // 🔥 Sửa đường dẫn delete cho khớp logic (bỏ /admin)
      const response = await fetch(`${serverUrl}/api/contact/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Message deleted");
        fetchContacts(); 
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error deleting message");
    }
  };

  // 3. Handle Mark as Read/Replied
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // 🔥 Sửa đường dẫn update cho khớp logic (bỏ /admin)
      const response = await fetch(`${serverUrl}/api/contact/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Marked as ${newStatus}`);
        fetchContacts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  // 4. Filter Logic
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      (contact.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.subject || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || contact.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "unread": return "bg-red-100 text-red-700 border-red-200";
      case "read": return "bg-blue-100 text-blue-700 border-blue-200";
      case "replied": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FaEnvelope className="text-blue-600" /> 
              Customer Messages
            </h1>
            <p className="text-gray-600 mt-1">Manage inquiries and support tickets</p>
          </div>
          <button
            onClick={fetchContacts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Messages</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
              <FaEnvelope />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending (Unread)</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.unread}</h3>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <FaExclamationCircle />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Replied</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.replied}</h3>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <FaCheckDouble />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="flex justify-center py-12"><SmallLoader /></div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FaEnvelope className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
            <p className="text-gray-500">Wait for customers to contact you.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredContacts.map((contact) => (
              <div 
                key={contact._id} 
                className={`bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
                  contact.status === 'unread' ? 'border-l-4 border-l-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* User Info & Message */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      <span className="text-sm text-gray-500">&lt;{contact.email}&gt;</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(contact.status)} capitalize`}>
                        {contact.status}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-800">{contact.subject}</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                      {contact.message}
                    </p>
                    
                    <div className="text-xs text-gray-400 mt-2">
                      Received: {new Date(contact.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 justify-start md:justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                    <a
                      href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                      onClick={() => handleStatusUpdate(contact._id, 'replied')}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors"
                    >
                      <FaReply /> Reply
                    </a>
                    
                    {contact.status === 'unread' && (
                      <button
                        onClick={() => handleStatusUpdate(contact._id, 'read')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
                      >
                        <FaCheckDouble /> Mark Read
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default Contacts;