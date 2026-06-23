import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const useQuery = () => new URLSearchParams(useLocation().search);

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-2.5 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ResetPassword = () => {
  const cardRef = useRef(null);
  const query = useQuery();
  const token = query.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transition = "transform 0.1s ease-out";
    card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 0.4s ease-out";
    card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset token is missing or invalid. Please request a new password reset link.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(res.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-bg min-h-[calc(100vh-3.75rem)] w-full flex items-center justify-center px-6 pt-10 pb-24 md:pb-32 overflow-hidden relative">
      {/* Glow blobs */}
      <div className="absolute top-[-120px] left-[-80px] w-[340px] h-[570px] rounded-full bg-indigo-500/20 blur-3xl"></div>
      <div className="absolute bottom-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-sky-500/20 blur-3xl"></div>
      <div className="absolute top-[-140px] right-[-80px] w-[550px] h-[350px] rounded-full bg-violet-500/20 blur-3xl"></div>

      {/* Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 w-full max-w-md will-change-transform transform-gpu"
      >
        <form
          onSubmit={handleSubmit}
          className="surface-bg animate-in w-full rounded-[30px] px-8 py-10 flex flex-col gap-6 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-main">Reset Password</h1>
            <p className="text-sm text-muted">Enter a new password for your account</p>
          </div>

          {!token && (
            <div className="px-4 py-3 rounded-2xl text-sm border bg-yellow-500/10 border-yellow-500/20 text-yellow-600">
              Reset token is missing. Use the link from your email or{' '}
              <Link to="/forgot-password" className="text-main font-semibold hover:underline">
                request a new link
              </Link>.
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-main">New Password</label>
            <input
              type="password"
              id="newPassword"
              placeholder="••••••••"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-soft surface-bg text-main placeholder-muted focus:outline-none focus:border-primary transition-all text-sm"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-2xl text-sm border bg-red-500/10 border-red-500/20 text-red-500">
              {error}
            </div>
          )}

          {message && (
            <div className="px-4 py-3 rounded-2xl text-sm border bg-green-500/10 border-green-500/20 text-green-500">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3 rounded-2xl cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner /> Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>

          <p className="text-center text-sm text-muted">
            Remembered it?{" "}
            <Link to="/login" className="text-main font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
