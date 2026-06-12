import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Upload } from "lucide-react";
import api from "../api/axios";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [primaryColor, setPrimaryColor] = useState(
    user?.primaryColor || "#3b8ea0",
  );
  const [profileImage, setProfileImage] = useState("");

  const handleNameUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await api.put("/auth/update-profile", {
        name,
      });

      setUser(res.data.user);
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update name");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await api.put("/auth/update-profile", {
        currentPassword,
        newPassword,
      });

      alert(res.data.message);

      setCurrentPassword("");
      NewPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update password");
    }
  };

  const handleThemeUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await api.put("/auth/update-profile", {
        primaryColor,
      });

      setUser(res.data.user);
      Alert("Theme updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update theme");
    }
  };

  const handleThemeReset = async () => {
    try {
      const res = await api.put("/auth/update-profile", {
        primaryColor: "#3b8ea0",
      });

      setUser(res.data.user);
      SetPrimaryColor("#3b8ea0");
      Alert("Theme reset successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reset theme");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 flex flex-col gap-8 shadow-sm animate-in">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/60等">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 min-w-0">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#3b8ea0] to-[#4eb7b3] flex items-center justify-center text-white text-3xl font-black shadow-md transition duration-300">
                {user?.photo || profileImage ? (
                  <img
                    src={profileImage || user?.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl shadow-md cursor-pointer hover:text-[#3b8ea0] dark:hover:text-white transition duration-150">
                <Upload size={14} strokeWidth={2.5} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const maxAllowedSize = 3 * 1024 * 1024;
                    if (file.size > maxAllowedSize) {
                      alert("File is too large! Please choose an image under 3MB.");
                      return;
                    }
                    const formData = new FormData();
                    formData.append("profileImage", file);

                    try {
                      const response = await api.post(
                        "/auth/upload-profile",
                        formData,
                        {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        },
                      );

                      if (response.data?.imageUrl) {
                        setProfileImage(response.data.imageUrl);
                        setUser(response.data.user);
                        alert("Profile picture updated successfully!");
                      }
                    } catch (error) {
                      console.error("Upload failed:", error);
                      alert(
                        error.response?.data?.error || "Error uploading image",
                      );
                    }
                  }}
                />
              </label>
            </div>

            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Manage your account details and security
              </p>
            </div>
          </div>

          <div className="text-center md:text-right shrink-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Logged in as</p>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Dynamic Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Update Name Form */}
          <form
            onSubmit={handleNameUpdate}
            className="flex flex-col justify-between gap-5 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Display Information</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Change how your name appears across your workspaces.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter new display name"
                  required
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
            >
              Save Name Changes
            </button>
          </form>

          {/* Password Form */}
          <form
            onSubmit={handlePasswordUpdate}
            className="flex flex-col justify-between gap-5 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Update your credentials regularly to maintain robust account security.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition-colors mt-2 cursor-pointer"
            >
              Update Password
            </button>
          </form>

          {/* Theme Form */}
          <form
            onSubmit={handleThemeUpdate}
            className="flex flex-col justify-between gap-5 bg-slate-50/50 dark:bg-slate-800/10 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 md:col-span-2 lg:col-span-1"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Theme Customization</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Personalize your user workspace accent colors to suit your mood.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="primaryColor" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Primary Color
                </label>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shrink-0 bg-transparent"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-mono font-bold uppercase">
                    {primaryColor}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 mt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save
              </button>

              <button
                type="button"
                onClick={handleThemeReset}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Reset Default
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;