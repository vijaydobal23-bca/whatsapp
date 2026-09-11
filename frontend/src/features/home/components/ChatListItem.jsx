import { formatChatTime } from "../utils/formatTime";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id?.toString?.() || "";
  return value.toString();
};

const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

const ChatListItem = ({
  chat,
  isSelected,
  onSelect,
  otherUser,
  currentUser,
  isOnline,
}) => {
  const lastMsg = chat.lastMessage;
  const isLastMessageMine = getId(lastMsg?.senderId) === getId(currentUser);

  const getLastMessagePreview = () => {
    if (!lastMsg) return "No messages yet";

    const prefix = isLastMessageMine ? "You: " : "";

    switch (lastMsg.messageType) {
      case "image":
        return `${prefix}Photo`;
      case "video":
        return `${prefix}Video`;
      case "file":
        return `${prefix}Document`;
      default:
        return `${prefix}${lastMsg.textMessage || ""}`;
    }
  };

  const getStatusIcon = () => {
    if (!lastMsg || !isLastMessageMine) return null;

    const isRead = lastMsg.messageStatus === "read";
    const isDelivered =
      lastMsg.messageStatus === "delivered" || lastMsg.messageStatus === "read";

    if (!isDelivered) {
      return (
        <svg
          viewBox="0 0 12 11"
          className="w-[14px] h-[11px] fill-[#8696a0] mr-1 flex-shrink-0"
          aria-label="sent"
        >
          <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.344.153l-.311.339a.514.514 0 0 0 0 .693l2.735 2.852a.454.454 0 0 0 .65 0l.286-.303 6.538-8.069a.477.477 0 0 0 .003-.68l-.336-.349z" />
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 16 11"
        className={`w-[18px] h-[11px] mr-1 flex-shrink-0 ${
          isRead ? "fill-[#53bdeb]" : "fill-[#8696a0]"
        }`}
        aria-label={isRead ? "read" : "delivered"}
      >
        <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.344.153l-.311.339a.514.514 0 0 0 0 .693l2.735 2.852a.454.454 0 0 0 .65 0l.286-.303 6.538-8.069a.477.477 0 0 0 .003-.68l-.336-.349z" />
        <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.009-1.052-.397.397 1.429 1.491a.454.454 0 0 0 .65 0l.286-.303 6.538-8.069a.477.477 0 0 0 .003-.68l-.336-.349z" />
      </svg>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors ${
        isSelected ? "bg-[#2a3942]" : "hover:bg-[#202c33]"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-[49px] h-[49px] rounded-full bg-[#6b7b8d] flex items-center justify-center overflow-hidden">
          {otherUser?.profilePicture ? (
            <img
              src={otherUser.profilePicture}
              alt={otherUser.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[#e9edef] text-[18px] font-medium">
              {getInitial(otherUser?.username)}
            </span>
          )}
        </div>
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#111b21] rounded-full ${
            isOnline ? "bg-[#00a884]" : "bg-[#8696a0]"
          }`}
          title={isOnline ? "online" : "offline"}
        />
      </div>

      <div className="flex-1 min-w-0 border-b border-[#222d34] py-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[#e9edef] text-[16px] font-normal truncate">
            {otherUser?.username || "Unknown"}
          </span>
          <span className="text-[#8696a0] text-[12px] ml-2 flex-shrink-0">
            {chat.lastMessageAt ? formatChatTime(chat.lastMessageAt) : ""}
          </span>
        </div>

        <div className="flex items-center min-w-0">
          {getStatusIcon()}
          <span className="text-[#8696a0] text-[13px] truncate">
            {getLastMessagePreview()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
