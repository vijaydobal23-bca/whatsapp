import { useEffect, useState, useCallback } from "react";
import { getCallHistoryApi } from "../api/calling.api";
import { useAuth } from "../../auth/hooks/useAuth";

/* ─── Helpers ───────────────────────────────────────── */
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const formatCallTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const oneDay = 86400000;

  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (diff < oneDay && now.getDate() === date.getDate()) {
    return `Today, ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) {
    return `Yesterday, ${timeStr}`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }) + `, ${timeStr}`;
};

const getStatusInfo = (call, userId) => {
  const isCaller = (call.callerId?._id || call.callerId) === userId;

  switch (call.status) {
    case "ended":
    case "accepted":
      return {
        label: isCaller ? "Outgoing" : "Incoming",
        color: "text-[#00a884]",
        icon: isCaller ? "outgoing" : "incoming",
      };
    case "missed":
      return {
        label: isCaller ? "No answer" : "Missed",
        color: isCaller ? "text-[#8696a0]" : "text-[#f15c6d]",
        icon: "missed",
      };
    case "rejected":
      return {
        label: isCaller ? "Declined" : "Rejected",
        color: "text-[#f15c6d]",
        icon: "missed",
      };
    case "calling":
      return {
        label: "Calling…",
        color: "text-[#8696a0]",
        icon: isCaller ? "outgoing" : "incoming",
      };
    default:
      return {
        label: call.status,
        color: "text-[#8696a0]",
        icon: "outgoing",
      };
  }
};

/* ─── Call status arrow icons ───────────────────────── */
const CallArrowIcon = ({ type, className = "" }) => {
  if (type === "missed") {
    return (
      <svg viewBox="0 0 16 16" className={`w-[14px] h-[14px] ${className}`}>
        <path
          fill="currentColor"
          d="M13.354 3.354a.5.5 0 0 0-.708-.708L8 7.293 4.854 4.146a.5.5 0 1 0-.708.708L7.293 8l-3.147 3.146a.5.5 0 0 0 .708.708L8 8.707l3.146 3.147a.5.5 0 0 0 .708-.708L8.707 8l3.147-3.146z"
        />
      </svg>
    );
  }

  // Arrow for outgoing (↗) or incoming (↙)
  const rotation = type === "outgoing" ? "-rotate-45" : "rotate-135";
  return (
    <svg viewBox="0 0 12 12" className={`w-[12px] h-[12px] ${rotation} ${className}`}>
      <path fill="currentColor" d="M1 1h9v2H4.414l6.293 6.293-1.414 1.414L3 4.414V8H1V1z" />
    </svg>
  );
};

/* ─── Single call history item ──────────────────────── */
const CallHistoryItem = ({ call, userId, onCallBack }) => {
  const isCaller = (call.callerId?._id || call.callerId) === userId;
  const otherUser = isCaller ? call.recipientId : call.callerId;
  const statusInfo = getStatusInfo(call, userId);
  const hasConnected = call.status === "ended" || call.status === "accepted";

  return (
    <div className="flex items-center px-3 py-[10px] hover:bg-[#202c33] transition-colors cursor-pointer">
      {/* Avatar */}
      <div className="w-[49px] h-[49px] rounded-full bg-[#6b7b8d] flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
        {otherUser?.profilePicture ? (
          <img
            src={otherUser.profilePicture}
            alt={otherUser.username}
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

      {/* Call info */}
      <div className="flex-1 min-w-0 border-b border-[#222d34] py-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-[15px] font-normal truncate ${statusInfo.icon === "missed" && !isCaller ? "text-[#f15c6d]" : "text-[#e9edef]"}`}>
            {otherUser?.username || "Unknown"}
          </span>
          <span className="text-[#8696a0] text-[11px] ml-2 flex-shrink-0">
            {formatCallTime(call.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <CallArrowIcon type={statusInfo.icon} className={statusInfo.color} />
            <span className={`text-[13px] truncate ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {/* Call type icon */}
            {call.callType === "video" ? (
              <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-[#8696a0] flex-shrink-0 ml-0.5">
                <path d="M15.25 9.17v-1.92c0-.83-.67-1.5-1.5-1.5H5c-.83 0-1.5.67-1.5 1.5v9.5c0 .83.67 1.5 1.5 1.5h8.75c.83 0 1.5-.67 1.5-1.5v-1.92l3.38 3.38c.58.58 1.37.17 1.37-.62V6.41c0-.79-.79-1.2-1.37-.62l-3.38 3.38z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] fill-[#8696a0] flex-shrink-0 ml-0.5">
                <path d="M19.077 15.198c-.601-.504-1.217-.95-1.843-1.335-.496-.306-.974-.458-1.477-.458-.587 0-1.122.258-1.658.797l-.382.384c-.126.126-.235.189-.344.189-.134 0-.305-.084-.556-.247l-.009-.006a13.28 13.28 0 0 1-2.691-2.322c-.778-.878-1.282-1.621-1.528-2.263a.577.577 0 0 1 .035-.509c.091-.152.243-.304.459-.456.192-.134.393-.284.598-.451.65-.529 1.078-1.155 1.078-1.778 0-.464-.16-.946-.478-1.459-.412-.662-.898-1.303-1.44-1.9C8.303 2.85 7.663 2.415 7.02 2.17a2.194 2.194 0 0 0-.833-.169c-.708 0-1.397.368-2.05 1.094-.536.597-.96 1.282-1.26 2.037C2.58 5.999 2.5 6.786 2.5 7.51c0 1.794.693 3.79 2.06 5.933 1.378 2.159 3.226 4.102 5.494 5.778 2.24 1.654 4.453 2.496 6.583 2.496h.001c.742 0 1.436-.129 2.062-.384.634-.258 1.2-.633 1.682-1.115.763-.763 1.118-1.524 1.118-2.395 0-.531-.187-1.04-.552-1.511a6.36 6.36 0 0 0-.449-.504l-1.422-1.61z" />
              </svg>
            )}
            {/* Duration if call connected */}
            {hasConnected && call.callDuration > 0 && (
              <span className="text-[#8696a0] text-[12px] ml-1 flex-shrink-0">
                · {formatDuration(call.callDuration)}
              </span>
            )}
          </div>

          {/* Callback button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCallBack(otherUser?._id, call.callType, otherUser?.username, otherUser?.profilePicture);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors flex-shrink-0 ml-2"
            title={`${call.callType === "video" ? "Video" : "Voice"} call`}
          >
            {call.callType === "video" ? (
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-[#00a884]">
                <path d="M15.25 9.17v-1.92c0-.83-.67-1.5-1.5-1.5H5c-.83 0-1.5.67-1.5 1.5v9.5c0 .83.67 1.5 1.5 1.5h8.75c.83 0 1.5-.67 1.5-1.5v-1.92l3.38 3.38c.58.58 1.37.17 1.37-.62V6.41c0-.79-.79-1.2-1.37-.62l-3.38 3.38z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-[#00a884]">
                <path d="M19.077 15.198c-.601-.504-1.217-.95-1.843-1.335-.496-.306-.974-.458-1.477-.458-.587 0-1.122.258-1.658.797l-.382.384c-.126.126-.235.189-.344.189-.134 0-.305-.084-.556-.247l-.009-.006a13.28 13.28 0 0 1-2.691-2.322c-.778-.878-1.282-1.621-1.528-2.263a.577.577 0 0 1 .035-.509c.091-.152.243-.304.459-.456.192-.134.393-.284.598-.451.65-.529 1.078-1.155 1.078-1.778 0-.464-.16-.946-.478-1.459-.412-.662-.898-1.303-1.44-1.9C8.303 2.85 7.663 2.415 7.02 2.17a2.194 2.194 0 0 0-.833-.169c-.708 0-1.397.368-2.05 1.094-.536.597-.96 1.282-1.26 2.037C2.58 5.999 2.5 6.786 2.5 7.51c0 1.794.693 3.79 2.06 5.933 1.378 2.159 3.226 4.102 5.494 5.778 2.24 1.654 4.453 2.496 6.583 2.496h.001c.742 0 1.436-.129 2.062-.384.634-.258 1.2-.633 1.682-1.115.763-.763 1.118-1.524 1.118-2.395 0-.531-.187-1.04-.552-1.511a6.36 6.36 0 0 0-.449-.504l-1.422-1.61z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── CallHistory main component ────────────────────── */
const CallHistory = ({ onCallBack }) => {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCallHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCallHistoryApi();
      setCalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error fetching call history:", err);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCallHistory();
  }, [fetchCallHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#8696a0]">
            <path d="M19.077 15.198c-.601-.504-1.217-.95-1.843-1.335-.496-.306-.974-.458-1.477-.458-.587 0-1.122.258-1.658.797l-.382.384c-.126.126-.235.189-.344.189-.134 0-.305-.084-.556-.247l-.009-.006a13.28 13.28 0 0 1-2.691-2.322c-.778-.878-1.282-1.621-1.528-2.263a.577.577 0 0 1 .035-.509c.091-.152.243-.304.459-.456.192-.134.393-.284.598-.451.65-.529 1.078-1.155 1.078-1.778 0-.464-.16-.946-.478-1.459-.412-.662-.898-1.303-1.44-1.9C8.303 2.85 7.663 2.415 7.02 2.17a2.194 2.194 0 0 0-.833-.169c-.708 0-1.397.368-2.05 1.094-.536.597-.96 1.282-1.26 2.037C2.58 5.999 2.5 6.786 2.5 7.51c0 1.794.693 3.79 2.06 5.933 1.378 2.159 3.226 4.102 5.494 5.778 2.24 1.654 4.453 2.496 6.583 2.496h.001c.742 0 1.436-.129 2.062-.384.634-.258 1.2-.633 1.682-1.115.763-.763 1.118-1.524 1.118-2.395 0-.531-.187-1.04-.552-1.511a6.36 6.36 0 0 0-.449-.504l-1.422-1.61z" />
          </svg>
        </div>
        <p className="text-[#8696a0] text-sm text-center">
          No call history yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      {calls.map((call) => (
        <CallHistoryItem
          key={call._id}
          call={call}
          userId={user?._id}
          onCallBack={onCallBack}
        />
      ))}
    </div>
  );
};

export default CallHistory;
