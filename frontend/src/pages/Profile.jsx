import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

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
      </div>
    </div>
  );
};

export default Profile;
