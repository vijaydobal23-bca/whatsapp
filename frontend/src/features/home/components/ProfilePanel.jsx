import { useState, useRef } from "react";

const ProfilePanel = ({ user, onClose, onUpdateProfile, loading }) => {
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "Hey there! I'm using WhatsApp.");
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  // Save profile
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await onUpdateProfile({
        username: username.trim() || undefined,
        bio,
        profilePicture: selectedFile || undefined,
      });

      setSuccess("Profile updated successfully!");
      setSelectedFile(null);
      setIsEditingName(false);
      setIsEditingBio(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    selectedFile ||
    username !== (user?.username || "") ||
    bio !== (user?.bio || "Hey there! I'm using WhatsApp.");

  return (
    <div className="absolute inset-0 z-50 flex">
      {/* Panel */}
      <div className="w-[420px] min-w-[320px] h-full bg-[#111b21] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="h-[108px] bg-[#202c33] flex items-end px-6 pb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={onClose}
              className="text-[#d9dee0] hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M12 4l1.41 1.41L7.83 11H20v2H7.83l5.58 5.59L12 20l-8-8 8-8z" />
              </svg>
            </button>
            <h2 className="text-[#d9dee0] text-[19px] font-medium">Profile</h2>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Profile picture */}
          <div className="flex justify-center py-7">
            <div className="relative group">
              <div className="w-[200px] h-[200px] rounded-full overflow-hidden bg-[#6b7b8d]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg viewBox="0 0 212 212" className="w-full h-full">
                    <path
                      fill="#DFE5E7"
                      d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z"
                    />
                    <path
                      fill="#FFF"
                      d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c0 .009-.005.015-.005.024a106.66 106.66 0 0 0 36.588 32.985 106.397 106.397 0 0 0 21.218 8.956c.025.005.045.015.07.02a106.201 106.201 0 0 0 50.615 0c.015-.005.04-.015.065-.02a106.36 106.36 0 0 0 21.218-8.956 106.643 106.643 0 0 0 36.588-32.985c-.005-.009-.005-.015-.01-.024a55.39 55.39 0 0 0-1.442-2.324z"
                    />
                    <path
                      fill="#FFF"
                      d="M106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z"
                    />
                  </svg>
                )}
              </div>

              {/* Camera overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full flex flex-col items-center justify-center bg-[#00000080] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 fill-white mb-1"
                >
                  <path d="M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H5v-9H3v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 14c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5-5 2.24-5 5zm5-3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3z" />
                </svg>
                <span className="text-white text-[13px] text-center leading-tight px-4">
                  CHANGE
                  <br />
                  PROFILE PHOTO
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Name section */}
          <div className="px-8 py-3">
            <label className="text-[#00a884] text-[14px] font-medium block mb-3">
              Your name
            </label>

            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={25}
                  autoFocus
                  className="flex-1 bg-transparent text-[#d1d7db] text-[17px] border-b-2 border-[#00a884] pb-2 outline-none"
                />
                <button
                  onClick={() => setIsEditingName(false)}
                  className="text-[#8696a0] hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-[#d1d7db] text-[17px]">
                  {username || "Add your name"}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[#8696a0] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
              </div>
            )}

            <p className="text-[#8696a0] text-[14px] mt-4 leading-[20px]">
              This is not your username or PIN. This name will be visible to your
              WhatsApp contacts.
            </p>
          </div>

          <div className="h-[10px] bg-[#0b141a]" />

          {/* About / Bio section */}
          <div className="px-8 py-3">
            <label className="text-[#00a884] text-[14px] font-medium block mb-3">
              About
            </label>

            {isEditingBio ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={139}
                  autoFocus
                  className="flex-1 bg-transparent text-[#d1d7db] text-[17px] border-b-2 border-[#00a884] pb-2 outline-none"
                />
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="text-[#8696a0] hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-[#d1d7db] text-[17px]">
                  {bio || "Add your bio"}
                </span>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="text-[#8696a0] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="h-[10px] bg-[#0b141a]" />

          {/* Email (read-only) */}
          <div className="px-8 py-3">
            <label className="text-[#00a884] text-[14px] font-medium block mb-3">
              Email
            </label>
            <div className="flex items-center justify-between">
              <span className="text-[#d1d7db] text-[17px]">
                {user?.email || ""}
              </span>
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#8696a0]">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
          </div>

          {/* Status messages */}
          {error && (
            <div className="mx-8 mt-3 px-4 py-2.5 bg-[#3b1c1c] border border-[#5c2b2b] rounded-lg text-[#f15c6d] text-[13px] flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mx-8 mt-3 px-4 py-2.5 bg-[#1c3b2a] border border-[#2b5c3d] rounded-lg text-[#00a884] text-[13px] flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
              {success}
            </div>
          )}

          {/* Save button */}
          {hasChanges && (
            <div className="px-8 py-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#00a884] hover:bg-[#06cf9c] disabled:opacity-50 disabled:cursor-not-allowed text-[#111b21] font-semibold py-3 rounded-lg text-[15px] transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#111b21] border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click-away backdrop */}
      <div
        className="flex-1 bg-transparent"
        onClick={onClose}
      />
    </div>
  );
};

export default ProfilePanel;
