import React, { useState, useRef, useContext, useEffect } from "react";
import { createPortal } from "react-dom"; // Import createPortal
import { X, Upload, Loader2 } from "lucide-react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const ProfilePictureUploadModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.photo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Body scroll lock/unlock logic
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflowY = "scroll"; // Allow modal content to scroll if needed
      // Store scroll position to restore later
      document.body.dataset.scrollY = scrollY.toString();
    } else {
      const scrollY = document.body.dataset.scrollY;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflowY = "";
      if (scrollY) {
        window.scrollTo({ top: parseInt(scrollY, 10), behavior: "instant" });
      }
      delete document.body.dataset.scrollY;
    }

    // Cleanup on unmount or modal close
    return () => {
      // Ensure body styles are reset if component unmounts while modal is open
      document.body.style.position = ""; // Reset in case of unmount
      document.body.style.overflowY = ""; // Reset in case of unmount
    };
  }, [isOpen]);

  useEffect(() => {
    // Update previewUrl if user's photo changes (e.g., after a successful upload)
    // or when the modal opens with a new user.photo
    setPreviewUrl(user?.photo || null);
  }, [user?.photo, isOpen]); // Re-run when user.photo changes or modal opens

  const handleFileChange = (event) => {
    setError("");
    const file = event.target.files[0];
    if (file) {
      // Client-side validation
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 3 * 1024 * 1024; // 3MB

      if (!allowedTypes.includes(file.type)) {
        setError("Only JPEG, PNG, and GIF images are allowed.");
        setSelectedFile(null);
        setPreviewUrl(user?.photo || null); // Revert to current user photo
        return;
      }
      if (file.size > maxSize) {
        setError("File size exceeds 3MB limit.");
        setSelectedFile(null);
        setPreviewUrl(user?.photo || null); // Revert to current user photo
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(user?.photo || null); // Revert to current user photo
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      const response = await axios.post(
        "/auth/upload-profile-picture", // Use the new dedicated endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.imageUrl) {
        setUser(response.data.user); // Update user context with new photo URL
        onClose(); // Close modal on success
      } else {
        setError("Upload failed: No image URL returned.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.response?.data?.error || "Error uploading image.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-in fade-in duration-200"
      onMouseDown={(e) => {
        // Close modal if backdrop is clicked
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card card-primary w-full max-w-md animate-in zoom-in-95 duration-200 relative"
        onMouseDown={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-main transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-main mb-4">Update Profile Picture</h2>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-primary/50">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl text-gray-500 dark:text-gray-400">👤</span>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="btn btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg border border-soft text-main hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            disabled={isLoading}
          >
            <Upload size={18} />
            {selectedFile ? "Change Selected Image" : "Select Image"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-muted"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="btn btn-primary flex items-center gap-2 cursor-pointer"
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {isLoading ? "Uploading..." : (selectedFile ? "Update Profile Picture" : "Upload Picture")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ProfilePictureUploadModal;