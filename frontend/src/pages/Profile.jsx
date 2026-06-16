import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { Eye, EyeOff, Upload } from "lucide-react";
import axios from "../api/axios";
import { AuthContext } from '../context/AuthContext';

// toast popup component - shows at bottom right
function Toast({ message, type }) {
  if (!message) return null;
  const base =
    "fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all duration-300";
  const color = type === "success" ? "bg-green-500" : "bg-red-500";
  return <div className={`${base} ${color}`}>{message}</div>;
}

function startAutoHide(setShow, timerRef) {
  clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => setShow(false), 5000);
}

function handleToggle(e, show, setShow, timerRef) {
  e.preventDefault();
  const next = !show;
  setShow(next);
  if (next) startAutoHide(setShow, timerRef);
  else clearTimeout(timerRef.current);
}

function EyeButton({ show, setShow, timerRef }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onMouseDown={(e) => handleToggle(e, show, setShow, timerRef)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  );
}

// component for the change password card
function ChangePasswordCard({ onUpdatePassword, onClearError, apiError }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const timerCurrent = useRef(null);
  const timerNew = useRef(null);
  const timerConfirm = useRef(null);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(timerCurrent.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(timerNew.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearTimeout(timerConfirm.current);
    };
  }, []);

  function handleBlur(setShow, timerRef) {
    setShow(false);
    clearTimeout(timerRef.current);
  }

  const passwordsMatch = newPassword === confirmPassword;
  const showMatchError = (confirmTouched || submitAttempted) && !passwordsMatch;

  function handleSubmit() {
    setSubmitAttempted(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      return;
    }

    if (!passwordsMatch) {
      return;
    }

    onUpdatePassword({ currentPassword, newPassword });
  }

  function handleCurrentPasswordChange(val) {
    setCurrentPassword(val);
    if (apiError) onClearError();
  }

  return (
    <div className="surface-bg rounded-2xl border border-soft p-7 flex flex-col gap-1">
      <h2 className="text-main text-lg font-bold mb-1">Change Password</h2>
      <p className="text-muted text-sm mb-5">Update your password to keep your account secure</p>

      <label className="text-main text-sm font-medium mb-1 block">Current Password</label>
      <div className="relative mb-1">
        <input
          type={showCurrent ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => handleCurrentPasswordChange(e.target.value)}
          onBlur={() => handleBlur(setShowCurrent, timerCurrent)}
          placeholder="Enter current password"
          className={`w-full pr-10 input-focus border rounded-lg px-3 py-2.5 text-sm text-main bg-transparent
            ${apiError ? "border-red-500" : "border-soft"}`}
        />
        <EyeButton show={showCurrent} setShow={setShowCurrent} timerRef={timerCurrent} />
      </div>

      {apiError && (
        <p className="text-red-500 text-xs mb-2">{apiError}</p>
      )}

      <label className="text-main text-sm font-medium mb-1 mt-3 block">New Password</label>
      <div className="relative">
        <input
          type={showNew ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onBlur={() => handleBlur(setShowNew, timerNew)}
          placeholder="Enter new password"
          className="w-full pr-10 input-focus border border-soft rounded-lg px-3 py-2.5 text-sm text-main bg-transparent"
        />
        <EyeButton show={showNew} setShow={setShowNew} timerRef={timerNew} />
      </div>

      <label className="text-main text-sm font-medium mb-1 mt-3 block">Confirm New Password</label>
      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => {
            setConfirmTouched(true);
            handleBlur(setShowConfirm, timerConfirm);
          }}
          placeholder="Re-enter new password"
          className={`w-full pr-10 input-focus border rounded-lg px-3 py-2.5 text-sm text-main bg-transparent
            ${showMatchError ? "border-red-500" : "border-soft"}`}
        />
        <EyeButton show={showConfirm} setShow={setShowConfirm} timerRef={timerConfirm} />
      </div>

      {showMatchError && (
        <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="hover-lift mt-5 w-full py-2.5 bg-[#3b82f6] hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors"
      >
        Update Password
      </button>
    </div>
  );
}

// main profile page
export default function Profile() {
  const { user, setUser } = useContext(AuthContext);

  const [toast, setToast] = useState({ message: "", type: "success" });
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // states
  const [name, setName] = useState(user?.name || '');
  const [primaryColor, setPrimaryColor] = useState(user?.primaryColor || '#4eb7b3');
  const [profileImage, setProfileImage] = useState("");
  
  // password states
  const [passwordError, setPasswordError] = useState("");
  const [passwordResetKey, setPasswordResetKey] = useState(0);

  async function handleNameUpdate(e) {
    if (e) e.preventDefault();
    try {
      const res = await axios.put("/auth/update-profile", { name });
      setUser(res.data.user);
      showToast(res.data.message || "Name updated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed To Update Name", "error");
    }
  }

  async function handleThemeSave(e) {
    if (e) e.preventDefault();
    try {
      const res = await axios.put("/auth/update-profile", { primaryColor });
      setUser(res.data.user);
      showToast("Theme Updated Successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed To Update Theme", "error");
    }
  }

  async function handleThemeReset(e) {
    if (e) e.preventDefault();
    try {
      const res = await axios.put("/auth/update-profile", { primaryColor: '#4eb7b3' });
      setUser(res.data.user);
      setPrimaryColor('#4eb7b3');
      showToast("Theme Reset Successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reset theme", "error");
    }
  }

  async function handlePasswordUpdate({ currentPassword, newPassword }) {
    setPasswordError("");
    try {
      await axios.put("/auth/update-profile", { currentPassword, newPassword });
      showToast("Password updated successfully!", "success");
      setPasswordResetKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.message || "Current Password Is Incorrect.";
      setPasswordError(msg);
      showToast(msg, "error");
    }
  }

  return (
    <div className="min-h-screen page-bg px-6 py-10">
      <Toast message={toast.message} type={toast.type} />

      {/* Merged Header: Avatar Upload (main) + Layout (feat) */}
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="flex items-center gap-5">
          <div className="flex flex-row gap-4 align-baseline">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-[#4eb7b3] to-[#98e1d7] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {user?.photo || profileImage ? (
                <img
                  src={profileImage || user?.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'S'
              )}
            </div>
            <label className="mt-10 bg-transparent dark:text-white text-black rounded-lg cursor-pointer transition text-sm font-medium hover:text-[#3b82f6]">
              <Upload />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  const maxAllowedSize = 3 * 1024 * 1024;
                  if (file.size > maxAllowedSize) {
                    showToast("File is too large! Please choose an image under 3MB.", "error");
                    return;
                  }
                  
                  const formData = new FormData();
                  formData.append("profileImage", file);

                  try {
                    const response = await axios.post(
                      "/auth/upload-profile",
                      formData,
                      {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    if (response.data?.imageUrl) {
                      setProfileImage(response.data.imageUrl);
                      setUser(response.data.user);
                      showToast("Profile picture updated successfully!", "success");
                    }
                  } catch (error) {
                    console.error("Upload failed:", error);
                    showToast(error.response?.data?.error || "Error uploading image", "error");
                  }
                }}
              />
            </label>
          </div>
        </div>
        
        <div>
          <h1 className="text-main text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted text-sm">Manage your account details and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* name card */}
        <div className="surface-bg rounded-2xl border border-soft p-7">
          <p className="text-muted text-sm mb-4">Change how your name appears across DailyForge</p>
          <label className="text-main text-sm font-medium mb-1 block">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full input-focus border border-soft rounded-lg px-3 py-2.5 text-sm text-main bg-transparent mb-4"
          />
          <button
            onClick={handleNameUpdate}
            className="hover-lift mt-5 w-full py-2.5 bg-[#3b82f6] hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Save Name Changes
          </button>
        </div>

        <ChangePasswordCard
          key={passwordResetKey}
          onUpdatePassword={handlePasswordUpdate}
          onClearError={() => setPasswordError("")}
          apiError={passwordError}
        />

        {/* theme card */}
        <div className="surface-bg rounded-2xl border border-soft p-7">
          <h2 className="text-main text-lg font-bold mb-1">Theme Settings</h2>
          <p className="text-muted text-sm mb-5">Personalize your interface with a custom primary color</p>
          <label className="text-main text-sm font-medium mb-2 block">Primary Color</label>
          <div className="flex items-center gap-3 mb-5">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-soft cursor-pointer bg-transparent"
            />
            <span className="text-main text-sm font-mono">{primaryColor}</span>
          </div>
          <div className="flex flex-col xl:flex-row gap-3">
            <button
              onClick={handleThemeSave}
              className="hover-lift flex-1 py-2.5 px-4 bg-[#3b82f6] hover:bg-blue-800 text-white rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
            >
              Save Theme Changes
            </button>
            <button
              onClick={handleThemeReset}
              className="flex-1 py-2.5 px-4 border border-soft text-main rounded-lg text-sm font-semibold whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}