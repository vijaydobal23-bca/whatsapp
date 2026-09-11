import React, { useEffect, useState, useRef } from "react";
import {
  uploadStatus,
  getMyStatus,
  getContactsStatuses,
  watchStatus,
} from "../api/home.api.js";
import { formatChatTime } from "../utils/formatTime";

const StatusSidebar = ({ onClose, currentUser }) => {
  const [myStatuses, setMyStatuses] = useState([]);
  const [contactStatuses, setContactStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingStatus, setViewingStatus] = useState(null);
  const [viewerProgress, setViewerProgress] = useState(0);
  const fileInputRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Fetch statuses on mount
  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const [myRes, contactsRes] = await Promise.all([
        getMyStatus(),
        getContactsStatuses(),
      ]);
      setMyStatuses(myRes?.status || []);

      // Group contact statuses by user
      const raw = contactsRes?.statuses || [];
      const grouped = {};
      raw.forEach((s) => {
        const userId = s.user?._id;
        if (!userId) return;
        if (!grouped[userId]) {
          grouped[userId] = {
            user: s.user,
            statuses: [],
            hasUnviewed: false,
          };
        }
        grouped[userId].statuses.push(s);
        if (!s.viewers?.includes(currentUser?._id)) {
          grouped[userId].hasUnviewed = true;
        }
      });
      setContactStatuses(Object.values(grouped));
    } catch (err) {
      console.log("error fetching statuses", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file select for uploading status
  const handleAddStatus = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("media", file);
      await uploadStatus(formData);
      await fetchStatuses();
    } catch (err) {
      console.log("error uploading status", err);
    } finally {
      setUploading(false);
    }
  };

  // View a status (fullscreen viewer)
  const openStatusViewer = async (statusItem) => {
    setViewingStatus(statusItem);
    setViewerProgress(0);

    // Mark as watched
    try {
      await watchStatus(statusItem._id);
    } catch (err) {
      console.log("error watching status", err);
    }

    // Auto-close after 5 seconds with progress bar
    let elapsed = 0;
    const interval = 50; // ms
    const duration = 5000; // ms
    progressTimerRef.current = setInterval(() => {
      elapsed += interval;
      setViewerProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        clearInterval(progressTimerRef.current);
        setViewingStatus(null);
        setViewerProgress(0);
      }
    }, interval);
  };

  const closeStatusViewer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setViewingStatus(null);
    setViewerProgress(0);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // Format status time like "Today at 1:46 pm"
  const formatStatusTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const time = date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today at ${time}`;
    return `${formatChatTime(dateString)} at ${time}`;
  };

  // Separate contact statuses into recent (unviewed) and viewed
  const recentStatuses = contactStatuses.filter((g) => g.hasUnviewed);
  const viewedStatuses = contactStatuses.filter((g) => !g.hasUnviewed);

  return (
    <div className="w-full h-full bg-[#111b21] flex flex-col absolute top-0 left-0 z-50">
      {/* Fullscreen Status Viewer */}
      {viewingStatus && (
        <div
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
          onClick={closeStatusViewer}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#ffffff30]">
            <div
              className="h-full bg-white transition-all duration-[50ms] ease-linear"
              style={{ width: `${viewerProgress}%` }}
            />
          </div>

          {/* Header */}
          <div className="absolute top-3 left-0 right-0 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2a3942]">
                {viewingStatus.user?.profilePicture ? (
                  <img
                    src={viewingStatus.user.profilePicture}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="#aebac1"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="text-white text-[15px] font-medium">
                  {viewingStatus.user?.username || "Unknown"}
                </p>
                <p className="text-[#ffffff99] text-[12px]">
                  {formatStatusTime(viewingStatus.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeStatusViewer();
              }}
              className="text-white hover:text-[#d1d7db] transition-colors p-2"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Media content */}
          <div
            className="max-w-[500px] max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {viewingStatus.mediaType === "video" ? (
              <video
                src={viewingStatus.mediaUrl}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg"
              />
            ) : (
              <img
                src={viewingStatus.mediaUrl}
                alt="Status"
                className="max-w-full max-h-[80vh] rounded-lg object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] bg-[#202c33]">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-[#aebac1] hover:text-[#d1d7db] transition-colors"
            title="Back"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
            </svg>
          </button>
          <h1 className="text-[#e9edef] text-[22px] font-medium">Status</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors text-[#aebac1] hover:text-[#d1d7db]">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path>
            </svg>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors text-[#aebac1] hover:text-[#d1d7db] disabled:opacity-50"
            title="Add status"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleAddStatus}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-4 mt-2">
        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* My Status */}
            <div
              onClick={() => {
                if (myStatuses.length > 0) {
                  openStatusViewer(myStatuses[0]);
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="flex items-center px-4 py-3 hover:bg-[#202c33] cursor-pointer transition-colors"
            >
              <div className="relative mr-4">
                <div
                  className={`w-[52px] h-[52px] rounded-full overflow-hidden flex items-center justify-center ${
                    myStatuses.length > 0
                      ? "border-[2.5px] border-[#00a884] p-[2px]"
                      : "bg-[#2a3942]"
                  }`}
                >
                  {currentUser?.profilePicture ? (
                    <img
                      src={currentUser.profilePicture}
                      alt="My status"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      width="30"
                      height="30"
                      fill="#aebac1"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                {myStatuses.length === 0 && (
                  <div className="absolute bottom-0 right-0 bg-[#00a884] rounded-full w-[22px] h-[22px] flex items-center justify-center border-[2.5px] border-[#111b21]">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="white"
                    >
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-[#e9edef] text-[17px] mb-0.5 font-normal">
                  My status
                </h2>
                <p className="text-[#8696a0] text-[14px]">
                  {myStatuses.length > 0
                    ? `${myStatuses.length} update${myStatuses.length > 1 ? "s" : ""} • ${formatStatusTime(myStatuses[0].createdAt)}`
                    : "Click to add status update"}
                </p>
              </div>
              {myStatuses.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors text-[#aebac1]"
                  title="Add another status"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Recent (unviewed contact statuses) */}
            {recentStatuses.length > 0 && (
              <>
                <div className="px-5 py-3 mt-4 text-[#00a884] text-[15px] font-medium">
                  Recent
                </div>
                {recentStatuses.map((group) => (
                  <div
                    key={group.user._id}
                    onClick={() => openStatusViewer(group.statuses[0])}
                    className="flex items-center px-4 py-3 hover:bg-[#202c33] cursor-pointer transition-colors"
                  >
                    <div className="relative mr-4">
                      <div className="w-[52px] h-[52px] rounded-full p-[2px] border-[2.5px] border-[#00a884]">
                        {group.user.profilePicture ? (
                          <img
                            src={group.user.profilePicture}
                            alt={group.user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#2a3942] flex items-center justify-center">
                            <svg
                              viewBox="0 0 24 24"
                              width="28"
                              height="28"
                              fill="#aebac1"
                            >
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[#e9edef] text-[17px] mb-0.5 font-normal">
                        {group.user.username}
                      </h2>
                      <p className="text-[#8696a0] text-[14px]">
                        {formatStatusTime(group.statuses[0].createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Viewed contact statuses */}
            {viewedStatuses.length > 0 && (
              <>
                <div className="px-5 py-3 mt-4 text-[#8696a0] text-[15px] font-medium">
                  Viewed
                </div>
                {viewedStatuses.map((group) => (
                  <div
                    key={group.user._id}
                    onClick={() => openStatusViewer(group.statuses[0])}
                    className="flex items-center px-4 py-3 hover:bg-[#202c33] cursor-pointer transition-colors"
                  >
                    <div className="relative mr-4">
                      <div className="w-[52px] h-[52px] rounded-full p-[2px] border-[2.5px] border-[#8696a0]">
                        {group.user.profilePicture ? (
                          <img
                            src={group.user.profilePicture}
                            alt={group.user.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-[#2a3942] flex items-center justify-center">
                            <svg
                              viewBox="0 0 24 24"
                              width="28"
                              height="28"
                              fill="#aebac1"
                            >
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-[#e9edef] text-[17px] mb-0.5 font-normal">
                        {group.user.username}
                      </h2>
                      <p className="text-[#8696a0] text-[14px]">
                        {formatStatusTime(group.statuses[0].createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Empty state */}
            {contactStatuses.length === 0 && myStatuses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 fill-[#8696a0]"
                  >
                    <path d="M12 20.664a9.163 9.163 0 0 1-6.521-2.702.977.977 0 0 1 1.381-1.381 7.269 7.269 0 0 0 10.024.244.977.977 0 0 1 1.313 1.445A9.192 9.192 0 0 1 12 20.664zm7.965-6.112a.977.977 0 0 1-.944-1.229 7.26 7.26 0 0 0-4.8-8.804.977.977 0 0 1 .594-1.86 9.212 9.212 0 0 1 6.092 11.169.976.976 0 0 1-.942.724zm-16.025-.39a.977.977 0 0 1-.953-.769 9.21 9.21 0 0 1 6.626-10.86.977.977 0 1 1 .444 1.897 7.259 7.259 0 0 0-5.141 8.53.977.977 0 0 1-.976 1.202z" />
                  </svg>
                </div>
                <p className="text-[#8696a0] text-sm text-center">
                  No status updates yet.
                </p>
                <p className="text-[#8696a0] text-xs text-center mt-1">
                  Click the + button to add your first status!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatusSidebar;
