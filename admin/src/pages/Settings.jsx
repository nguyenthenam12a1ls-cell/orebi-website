import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";
import { serverUrl } from "../../config";
import { setUser } from "../redux/authSlice";
import Container from "../components/Container";
import Title from "../components/ui/title";
import { 
  FaUserCog, 
  FaGlobe, 
  FaLock, 
  FaSave, 
  FaCamera 
} from "react-icons/fa";
import { MdOutlineSecurity } from "react-icons/md";

const Settings = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // --- STATE CHO PROFILE (Lưu Database) ---
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // --- STATE CHO CONFIG (Lưu LocalStorage) ---
  const [siteConfig, setSiteConfig] = useState({
    siteName: "Orebi Admin",
    currency: "USD",
    timezone: "UTC",
    notifications: true
  });

  // 1. Load dữ liệu ban đầu
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        avatar: user.avatar || ""
      }));
      setAvatarPreview(user.avatar || "");
    }

    // Load Local Settings
    const savedConfig = localStorage.getItem("adminSiteConfig");
    if (savedConfig) {
      setSiteConfig(JSON.parse(savedConfig));
    }
  }, [user]);

  // 2. Xử lý Upload Avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 3. API: Cập nhật Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Nếu có đổi avatar thì gọi API upload avatar trước (nếu backend hỗ trợ tách riêng)
      // Hoặc gửi form data chung. Ở đây mình giả định dùng endpoint update profile chung.
      
      // Tuy nhiên, backend của bạn userRoute có /api/user/profile (PUT)
      // Hãy kiểm tra xem nó nhận JSON hay FormData. 
      // Thường update profile có ảnh sẽ dùng FormData.
      
      // Nếu backend chưa hỗ trợ upload avatar trong route update profile, 
      // ta sẽ chỉ update thông tin text trước.
      
      const updatePayload = {
        name: profileData.name,
        email: profileData.email,
      };

      if (profileData.newPassword) {
        updatePayload.password = profileData.newPassword;
      }

      // Gọi API Update Profile
      const response = await axios.put(
        `${serverUrl}/api/user/profile`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        dispatch(setUser(response.data.user));
        // Reset password fields
        setProfileData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      } else {
        toast.error(response.data.message || "Update failed");
      }

    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // 4. Local: Lưu cấu hình Site
  const handleSaveConfig = () => {
    localStorage.setItem("adminSiteConfig", JSON.stringify(siteConfig));
    toast.success("Site configuration saved locally!");
    // Có thể thêm logic đổi title web ngay lập tức
    document.title = siteConfig.siteName;
  };

  return (
    <Container>
      <div className="max-w-4xl mx-auto space-y-6">
        <Title>Settings</Title>

        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 pt-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-6 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === "profile"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaUserCog /> My Account
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-4 px-6 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === "general"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FaGlobe /> General Config
          </button>
        </div>

        {/* Tab Content: Profile */}
        {activeTab === "profile" && (
          <div className="bg-white p-8 rounded-b-xl rounded-tr-xl shadow-sm border border-t-0 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-100">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                        {profileData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
                    <FaCamera size={14} />
                  </label>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Profile Picture</p>
                  <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG (Max 2MB)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaLock className="text-gray-400" /> Change Password
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : <><FaSave /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Content: General Config */}
        {activeTab === "general" && (
          <div className="bg-white p-8 rounded-b-xl rounded-tr-xl shadow-sm border border-t-0 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">System Configuration</h3>
            <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-6 border border-yellow-200">
              Note: These settings are saved locally in your browser for this admin panel interface.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={siteConfig.siteName}
                  onChange={(e) => setSiteConfig({...siteConfig, siteName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">This will appear in the browser tab and dashboard header.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                  <select
                    value={siteConfig.currency}
                    onChange={(e) => setSiteConfig({...siteConfig, currency: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="VND">VND (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={siteConfig.timezone}
                    onChange={(e) => setSiteConfig({...siteConfig, timezone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="UTC">UTC (Universal)</option>
                    <option value="GMT+7">GMT+7 (Vietnam, Thailand)</option>
                    <option value="EST">EST (New York)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={siteConfig.notifications}
                  onChange={(e) => setSiteConfig({...siteConfig, notifications: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="notifications" className="text-sm text-gray-700">Enable Desktop Notifications</label>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
                <button
                  onClick={handleSaveConfig}
                  className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <MdOutlineSecurity /> Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Settings;