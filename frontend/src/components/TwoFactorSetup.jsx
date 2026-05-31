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
    <div className="surface-bg p-6 rounded-2xl flex flex-col gap-4 max-w-sm">
      <h2 className="text-xl font-bold text-main">Two-Factor Authentication</h2>

      {!qrCode && !enabled && (
        <button onClick={startSetup} className="btn btn-primary cursor-pointer hover-lift">
          Enable 2FA
        </button>
      )}

      {qrCode && (
        <>
          <p className="text-sm text-muted">Scan this QR code with Google Authenticator:</p>
          <img src={qrCode} alt="2FA QR Code" className="rounded-lg" />
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            maxLength={6}
            className="w-full px-3 py-2.5 text-sm surface-bg border-soft rounded-sm shadow-xs input-focus"
          />
          <button onClick={verifyAndEnable} className="btn btn-primary cursor-pointer hover-lift">
            Verify & Activate
          </button>
        </>
      )}

      {enabled && (
        <button onClick={disable2FA} className="btn cursor-pointer hover-lift text-red-500">
          Disable 2FA
        </button>
      )}

      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
};

export default TwoFactorSetup;