import { useState } from "react";
import api from "../api/axios";

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(false);

  const startSetup = async () => {
    try {
      const res = await api.post("/auth/2fa/setup");
      setQrCode(res.data.qrCodeUrl);
      setMessage("");
    } catch {
      setMessage("Error starting 2FA setup.");
    }
  };

  const verifyAndEnable = async () => {
    try {
      const res = await api.post("/auth/2fa/verify", { token: totpCode });
      setMessage(res.data.message);
      setEnabled(true);
      setQrCode(null);
    } catch {
      setMessage("Invalid code, try again.");
    }
  };

  const disable2FA = async () => {
    try {
      const res = await api.post("/auth/2fa/disable");
      setMessage(res.data.message);
      setEnabled(false);
    } catch {
      setMessage("Error disabling 2FA.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-4 max-w-sm shadow-sm transition-colors duration-300">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h2>

      {!qrCode && !enabled && (
        <button
          onClick={startSetup}
          className="px-4 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Enable 2FA
        </button>
      )}

      {qrCode && (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">Scan this QR code with Google Authenticator:</p>
          <div className="p-3 bg-white border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center max-w-[200px] mx-auto">
            <img src={qrCode} alt="2FA QR Code" className="rounded-lg w-full h-auto" />
          </div>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            maxLength={6}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-[#3b8ea0] transition-all box-border"
          />
          <button
            onClick={verifyAndEnable}
            className="px-4 py-2.5 bg-[#3b8ea0] hover:bg-[#4eb7b3] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Verify & Activate
          </button>
        </>
      )}

      {enabled && (
        <button
          onClick={disable2FA}
          className="px-4 py-2.5 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Disable 2FA
        </button>
      )}

      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          {message}
        </p>
      )}
    </div>
  );
};

export default TwoFactorSetup;