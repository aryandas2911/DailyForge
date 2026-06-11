import {useState,useRef,useEffect,useContext} from "react";
import {Eye,EyeOff} from "lucide-react";
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

//Change Password Card 
function ChangePasswordCard({onUpdatePassword}){
  //field values
  const[currentPassword,setCurrentPassword]=useState("");
  const[newPassword,setNewPassword]=useState("");
  const[confirmPassword,setConfirmPassword]=useState("");

  //visibility states
  const[showCurrent,setShowCurrent]=useState(false);
  const[showNew,setShowNew]=useState(false);
  const[showConfirm,setShowConfirm]=useState(false);

  //validation
  const[confirmTouched,setConfirmTouched]=useState(false);
  const[submitAttempted,setsubmitAttempted]=useState(false);

  //timeout references for auto-remasking
  const timerCurrent=useRef(null);
  const timerNew=useRef(null);
  const timerConfirm =useRef(null);

  useEffect(()=>{
    return() =>{
     clearTimeout(timerCurrent.current);
     clearTimeout(timerNew.current);
     clearTimeout(timerConfirm.current);
    };
  },[]);

//generic helpers
function startAutoHideTimer(setShow,timerRef)
{
  clearTimeout(timerRef.current);
  timerRef.current=setTimeout(()=>setShow(false),5000);
}

function handleToggle(e,show,setShow,timerRef)
{
  e.preventDefault();
  const next=!show;
  setShow(next);
  if(next){
   startAutoHideTimer(setShow,timerRef);
  }
  else
  {
    clearTimeout(timerRef.current);
  }
}

  function handleBlur(setShow, timerRef) {
    setShow(false);
    clearTimeout(timerRef.current);
  }

  //validation
  const passwordsMatch = newPassword === confirmPassword;
  const showMatchError = (confirmTouched || submitAttempted) && !passwordsMatch;

  function handleSubmit() {
    setSubmitAttempted(true);
    if (!passwordsMatch) return;
    onUpdatePassword?.({ currentPassword, newPassword });
  }

  //resuable eye toggle button
  function EyeButton({show,setShow,timerRef})
  {
    return(
      <button type="button"
      tabIndex={-1}
      onMouseDown={(e) => handleToggle(e,show,setShow,timerRef)}
      style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          color: "#6b7280",
          display: "flex",
          alignItems: "center", 
      }}
      aria-label={show ? "Hide password" : "Show password"}
      >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    );
  }

  //shared input wrapper style
  const inputWrapperStyle = { position: "relative", display: "flex", alignItems: "center" };
  const inputStyle = {
    width: "100%",
    padding: "10px 40px 10px 12px",
    border: "1.5px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return(
<div style={{
  background :"#fff",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  padding: "28px",
  flex: 1,
}}>
      <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
        Change Password
      </h2>
      <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#3b82f6" }}>
        Update your password to keep your account secure
      </p>

  
      {/* current Password */}
      <label style={labelStyle}>Current Password</label>
      <div style={inputWrapperStyle}>
        <input
          type={showCurrent ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          onBlur={() => handleBlur(setShowCurrent, timerCurrent)}
          style={inputStyle}
          placeholder="Enter current password"
        />
        <EyeButton show={showCurrent} setShow={setShowCurrent} timerRef={timerCurrent} />
      </div>

      {/* new Password */}
      <label style={{ ...labelStyle, marginTop: "16px" }}>New Password</label>
      <div style={inputWrapperStyle}>
        <input
          type={showNew ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onBlur={() => handleBlur(setShowNew, timerNew)}
          style={inputStyle}
          placeholder="Enter new password"
        />
        <EyeButton show={showNew} setShow={setShowNew} timerRef={timerNew} />
      </div>

      {/* confirm New Password */}
      <label style={{ ...labelStyle, marginTop: "16px" }}>Confirm New Password</label>
      <div style={inputWrapperStyle}>
        <input
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => {
            setConfirmTouched(true);
            handleBlur(setShowConfirm, timerConfirm);
          }}
          style={{
            ...inputStyle,
            borderColor: showMatchError ? "#ef4444" : "#cbd5e1",
          }}
          placeholder="Re-enter new password"
        />
        <EyeButton show={showConfirm} setShow={setShowConfirm} timerRef={timerConfirm} />

</div>
{/* inline match error */}
      {showMatchError && (
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#ef4444" }}>
          Passwords do not match
        </p>
      )}

      {/* submit */}
      <button
        type="button"
        onClick={handleSubmit}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "12px",
          background: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Update Password
      </button>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "6px",
};

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  // states
  const [name, setName] = useState(user?.name || '');
  const [primaryColor, setPrimaryColor] = useState(user?.primaryColor || '#4eb7b3');

  // update name handler
  const handleNameUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await api.put('/auth/update-profile', {name,});
      // update user in context
      setUser(res.data.user);
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed To Update Name');
    }
  };

  // update password handler
  const handlePasswordUpdate = async ({currentPassword,newPassword}) => {
    try
    {
      const res = await api.put('/auth/update-profile', {
        currentPassword,
        newPassword,
      });
      alert(res.data.message);
    }
    catch (error)
    {
      alert(error.response?.data?.message || 'Failed To Update Password');
    }
  };

  // update theme handler
  const handleThemeUpdate = async (e) => {
    e.preventDefault();

    try
    {
      const res = await api.put('/auth/update-profile', {primaryColor});
      setUser(res.data.user);
      alert('Theme Updated Successfully');
    }
    catch (error)
    {
      alert(error.response?.data?.message || 'Failed To Update Theme');
    }
  };

  // reset theme handler
  const handleThemeReset = async () => {
    try
    {
      const res = await api.put('/auth/update-profile', {primaryColor: '#4eb7b3'});
      setUser(res.data.user);
      setPrimaryColor('#4eb7b3');
      alert('Theme Reset Successfully');
    } 
    catch (error)
    {
      alert(error.response?.data?.message || 'Failed to reset theme');
    }
  };

  return (
    <div className="min-h-screen w-full px-6 py-10">
      <div
        className="
      max-w-6xl mx-auto
      surface-bg rounded-3xl
      p-8 md:p-12
      flex flex-col gap-10
      animate-in
    "
      >
        {/* Profile Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="
        w-20 h-20 rounded-full
        bg-gradient-to-tr
        from-[#4eb7b3]
        to-[#98e1d7]
        flex items-center justify-center
        text-white text-3xl font-bold
      "
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-main">Profile Settings</h1>

              <p className="text-muted mt-1">
                Manage your account details and security
              </p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-muted">Logged in as</p>

            <p className="font-semibold text-main">{user?.email}</p>
          </div>
        </div>
        {/* Update Name Section */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form
            onSubmit={handleNameUpdate}
            className="
  flex flex-col gap-5
  border-soft rounded-2xl
  p-6
"
          >
            <div className="space-y-1">
              <p className="text-sm text-muted">
                Change how your name appears across DailyForge
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-main">
                Display Name
              </label>

              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Enter new display name"
                required
                className="
              w-full px-3 py-2.5
              text-sm
              surface-bg
              border-soft
              rounded-sm
              shadow-xs
              input-focus hover-lift
            "
              />
            </div>

            <button
              type="submit"
              className="
            btn btn-primary
            cursor-pointer
            w-full
          "
            >
              Save Name Changes
            </button>
          </form>

          {/* Password Section */}
          <ChangePasswordCard onUpdatePassword={handlePasswordUpdate} />
         
          {/* Theme Section */}

          <form
            onSubmit={handleThemeUpdate}
            className="
  flex flex-col gap-5
  border-soft rounded-2xl
  p-6
"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-main">
                Theme Settings
              </h2>

              <p className="text-sm text-muted">
                Personalize your interface with a custom primary color
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="primaryColor" className="text-sm font-medium text-main">
                Primary Color
              </label>

              <div className="flex items-center gap-4">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-sm text-muted font-mono">{primaryColor}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="
                  btn btn-primary
                  cursor-pointer
                  flex-1
                "
              >
                Save Theme Changes
              </button>
              
              <button
                type="button"
                onClick={handleThemeReset}
                className="
                  btn
                  bg-transparent
                  border border-soft
                  text-main
                  hover:bg-gray-100 dark:hover:bg-slate-800
                  cursor-pointer
                  flex-1
                "
              >
                Reset to Default
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
