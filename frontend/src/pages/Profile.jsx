import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useAISettings } from '../context/AISettingsContext';
import { Sparkles, Lock, Bot, Clock, Bell, Wand2, Flame } from 'lucide-react';

const Profile = () => {
  const Toggle = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
      disabled ? 'opacity-40 cursor-not-allowed' : ''
    } ${checked ? 'bg-[#4eb7b3]' : 'bg-gray-300 dark:bg-gray-600'}`}
    aria-checked={checked}
    role="switch"
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);
  // auth context
  const { user, setUser } = useContext(AuthContext);
  const {
    isPro, setIsPro,
    aiCoachEnabled, setAiCoachEnabled,
    schedulingEnabled, setSchedulingEnabled,
    nudgesEnabled, setNudgesEnabled,
    nlRoutineEnabled, setNlRoutineEnabled,
    overloadEnabled, setOverloadEnabled,
  } = useAISettings();

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

        {/* AI Settings */}
        <div className="flex flex-col gap-5 border-soft rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#4eb7b3]" />
            <h2 className="text-lg font-semibold text-main">AI Settings</h2>
          </div>

          <div className="flex items-center justify-between gap-4 border-soft rounded-xl p-4 bg-gradient-to-r from-[#4eb7b3]/5 to-transparent">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-[#4eb7b3]" />
              <div>
                <p className="text-sm font-semibold text-main">Pro Plan</p>
                <p className="text-xs text-muted">Enables all AI-powered features below</p>
              </div>
            </div>
            <Toggle checked={isPro} onChange={setIsPro} />
          </div>

          {[
            { icon: Bot, label: 'AI Routine Coach', desc: 'Weekly summary with pattern analysis & suggestions', val: aiCoachEnabled, set: setAiCoachEnabled },
            { icon: Clock, label: 'Smart Scheduling', desc: 'Optimal time slot recommendations based on history', val: schedulingEnabled, set: setSchedulingEnabled },
            { icon: Bell, label: 'Adaptive Nudges', desc: 'Context-aware reminders by time of day & streak health', val: nudgesEnabled, set: setNudgesEnabled },
            { icon: Wand2, label: 'Natural Language Routine', desc: 'Generate routines from a goal description', val: nlRoutineEnabled, set: setNlRoutineEnabled },
            { icon: Flame, label: 'Burnout & Overload Detection', desc: 'Flag unsustainable plans & suggest fallback routines', val: overloadEnabled, set: setOverloadEnabled },
          ].map(({ icon: Icon, label, desc, val, set }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-main">{label}</p>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </div>
              <Toggle checked={val} onChange={set} disabled={!isPro} />
            </div>
          ))}

          {!isPro && (
            <p className="text-xs text-muted text-center pt-1">
              Enable <span className="text-[#4eb7b3] font-medium">Pro</span> above to activate AI features.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
