import { useState } from "react";
import api from "../../api/axios.js";

export default function ShareRoutineModal({
  routine,
  onClose,
  onShared,
}) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("viewer");
  const [loading, setLoading] = useState(false);

  const handleShareRoutine = async () => {
    if (!email.trim()) {
      alert("Please enter user email");
      return;
    }

    try {
      setLoading(true);

      await api.post(`/routines/${routine._id}/share`, {
        email,
        permission,
      });

      alert("Routine shared successfully");

      setEmail("");
      setPermission("viewer");

      if (onShared) {
        onShared();
      }

      onClose();

    } catch (err) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
        "Failed to share routine"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in">
      <div className="card card-primary w-full max-w-md animate-in delay-100">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-main">
              Share Routine
            </h3>

            <p className="text-sm text-muted mt-1">
              Share "{routine.name}" with another user
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-main transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* email input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-main block mb-2">
            User Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter registered user email"
            className="w-full rounded-xl border-soft px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* permission select */}
        <div className="mb-6">
          <label className="text-sm font-medium text-main block mb-2">
            Permission
          </label>

          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            className="w-full rounded-xl border-soft px-3 py-2 text-sm focus:outline-none bg-white"
          >
            <option value="viewer">
              Viewer
            </option>

            <option value="editor">
              Editor
            </option>
          </select>

          <p className="text-xs text-muted mt-2">
            Viewers can only see routines. Editors can modify routines.
          </p>
        </div>

        {/* action buttons */}
        <div className="flex justify-end gap-3">
          <button
            className="btn btn-muted"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary cursor-pointer"
            onClick={handleShareRoutine}
            disabled={loading}
          >
            {loading ? "Sharing..." : "Share Routine"}
          </button>
        </div>
      </div>
    </div>
  );
}