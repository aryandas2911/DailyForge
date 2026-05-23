import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Snowflake } from 'lucide-react';

const Profile = () => {
  // auth context
  const { user, setUser } = useContext(AuthContext);

  // states
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // update name handler
  const handleNameUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await api.patch('/auth/profile', {
        name,
      });

      // update user in context
      setUser(res.data.user);

      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update name');
    }
  };

  // update password handler
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    try {
      const res = await api.patch('/auth/profile', {
        currentPassword,
        newPassword,
      });

      alert(res.data.message);

      // clear password fields
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
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

          <form
            onSubmit={handlePasswordUpdate}
            className="
  flex flex-col gap-5
  border-soft rounded-2xl
  p-6
"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-main">
                Change Password
              </h2>

              <p className="text-sm text-muted">
                Update your password to keep your account secure
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="currentPassword"
                className="text-sm font-medium text-main"
              >
                Current Password
              </label>

              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                }}
                placeholder="Enter current password"
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

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="newPassword"
                className="text-sm font-medium text-main"
              >
                New Password
              </label>

              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
                placeholder="Enter new password"
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
              Update Password
            </button>
          </form>
        </div>

        {/* Streak Protection Stats section */}
        <div className="border-soft rounded-2xl p-6 bg-gradient-to-tr from-blue-500/5 to-[#4eb7b3]/5 dark:from-blue-950/10 dark:to-[#4eb7b3]/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Snowflake size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-main">Streak Protection & Freezes</h2>
              <p className="text-xs text-muted">Prevent your hard-earned habit streaks from resetting</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/50 dark:bg-slate-800/40 border border-soft/30 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Freezes Available</span>
              <span className="text-3xl font-extrabold text-blue-500 mt-2 flex items-center gap-1.5">
                <Snowflake size={20} />
                {user?.streakFreezeCount ?? 2}
              </span>
              <span className="text-[10px] text-muted/80 mt-1">Replenishes to 2 at the start of each month</span>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-800/40 border border-soft/30 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Total Freezes Consumed</span>
              <span className="text-3xl font-extrabold text-main mt-2">
                {user?.freezesUsed ?? 0}
              </span>
              <span className="text-[10px] text-muted/80 mt-1">Automatic streak protections applied</span>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/40 border border-soft/30 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Manual Recoveries Used</span>
              <span className="text-3xl font-extrabold text-main mt-2">
                {user?.recoveredStreaks ?? 0}
              </span>
              <span className="text-[10px] text-muted/80 mt-1">Streaks restored manually in 24h</span>
            </div>
          </div>
          
          <div className="mt-6 border-t border-soft/30 pt-4 text-xs text-muted/90 leading-relaxed space-y-1">
            <p>💡 <strong>How it works:</strong> If you miss a day, a Streak Freeze is automatically consumed (if you have one available) to protect your habit streak.</p>
            <p>⏳ If you had 0 freezes remaining and your streak broke, you can manually click <strong>Recover Streak</strong> within 24 hours (of a missed day) using a newly replenished freeze to restore your consistency records.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
