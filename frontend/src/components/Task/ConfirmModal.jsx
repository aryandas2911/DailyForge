import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Delete",
  message = "Are you sure?",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="text-red-500" size={24} />
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-main">
              {title}
            </h2>

            <p className="text-sm text-muted mt-2">
              {message}
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-soft text-main hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}