import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { formatChatTime } from "../utils/formatTime";

const ChatArea = ({
  user,
  selectedChat,
  messages,
  setSelectedChat,
  getOtherParticipant,
  handleSendMessage,
  handleFileUpload,
  fetchMessages,
  onlineUsers,
}) => {
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const otherUser = getOtherParticipant(selectedChat);
  const isOtherUserOnline = onlineUsers?.includes(otherUser?._id);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMedia(file);
      // Create preview URL for images/videos
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setMediaPreview(URL.createObjectURL(file));
      } else {
        setMediaPreview(null);
      }
    }
    // Reset input so same file can be re-selected
    event.target.value = "";
  };

  const clearMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMedia(null);
    setMediaPreview(null);
  };

  const handleSendMedia = async () => {
    if (!media || !otherUser?._id || uploading) return;

    try {
      setUploading(true);
      await handleFileUpload(media, otherUser._id);
      clearMedia();
    } catch (err) {
      console.log("error sending media", err);
    } finally {
      setUploading(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (selectedChat?._id) {
      fetchMessages(selectedChat._id);
    }
  }, [fetchMessages, selectedChat?._id]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!otherUser?._id || !messageText.trim() || sending) return;

    try {
      setSending(true);
      await handleSendMessage(otherUser._id, messageText.trim(), "text");
      setMessageText("");
    } finally {
      setSending(false);
    }
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // Get file type label for preview
  const getFileTypeLabel = (file) => {
    if (!file) return "";
    if (file.type.startsWith("image/")) return "Image";
    if (file.type.startsWith("video/")) return "Video";
    return "Document";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="h-[60px] px-4 flex items-center justify-between bg-[#202c33] border-b border-[#222d34]">
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          <button
            onClick={() => setSelectedChat(null)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors mr-1"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#aebac1]">
              <path d="M12 4l1.41 1.41L7.83 11H20v2H7.83l5.58 5.59L12 20l-8-8 8-8z" />
            </svg>
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#6b7b8d] flex items-center justify-center overflow-hidden cursor-pointer">
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

          {/* Name & status */}
          <div>
            <h3 className="text-[#e9edef] text-[16px] font-normal leading-tight">
              {otherUser?.username || "Unknown"}
            </h3>
            <p className="text-[#8696a0] text-[12px]">
              {isOtherUserOnline
                ? "online"
                : otherUser?.lastSeen
                  ? `last seen ${formatChatTime(otherUser.lastSeen)}`
                  : "offline"}
            </p>
          </div>
        </div>

        {/* Header action icons */}
        <div className="flex items-center gap-1">
          {/* Video call */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] fill-[#aebac1]"
            >
              <path d="M15.25 9.17v-1.92c0-.83-.67-1.5-1.5-1.5H5c-.83 0-1.5.67-1.5 1.5v9.5c0 .83.67 1.5 1.5 1.5h8.75c.83 0 1.5-.67 1.5-1.5v-1.92l3.38 3.38c.58.58 1.37.17 1.37-.62V6.41c0-.79-.79-1.2-1.37-.62l-3.38 3.38z" />
            </svg>
          </button>

          {/* Voice call */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] fill-[#aebac1]"
            >
              <path d="M19.077 15.198c-.601-.504-1.217-.95-1.843-1.335-.496-.306-.974-.458-1.477-.458-.587 0-1.122.258-1.658.797l-.382.384c-.126.126-.235.189-.344.189-.134 0-.305-.084-.556-.247l-.009-.006a13.28 13.28 0 0 1-2.691-2.322c-.778-.878-1.282-1.621-1.528-2.263a.577.577 0 0 1 .035-.509c.091-.152.243-.304.459-.456.192-.134.393-.284.598-.451.65-.529 1.078-1.155 1.078-1.778 0-.464-.16-.946-.478-1.459-.412-.662-.898-1.303-1.44-1.9C8.303 2.85 7.663 2.415 7.02 2.17a2.194 2.194 0 0 0-.833-.169c-.708 0-1.397.368-2.05 1.094-.536.597-.96 1.282-1.26 2.037C2.58 5.999 2.5 6.786 2.5 7.51c0 1.794.693 3.79 2.06 5.933 1.378 2.159 3.226 4.102 5.494 5.778 2.24 1.654 4.453 2.496 6.583 2.496h.001c.742 0 1.436-.129 2.062-.384.634-.258 1.2-.633 1.682-1.115.763-.763 1.118-1.524 1.118-2.395 0-.531-.187-1.04-.552-1.511a6.36 6.36 0 0 0-.449-.504l-1.422-1.61z" />
            </svg>
          </button>

          {/* Search */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] fill-[#aebac1]"
            >
              <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z" />
            </svg>
          </button>

          {/* Menu */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] fill-[#aebac1]"
            >
              <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-12 py-4 scrollbar-thin"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23182229' fill-opacity='0.6'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='13' cy='23' r='1'/%3E%3Ccircle cx='43' cy='13' r='1.2'/%3E%3Ccircle cx='73' cy='43' r='0.8'/%3E%3Ccircle cx='103' cy='3' r='1'/%3E%3Ccircle cx='133' cy='53' r='1.5'/%3E%3Ccircle cx='163' cy='23' r='0.8'/%3E%3Ccircle cx='193' cy='83' r='1'/%3E%3Ccircle cx='23' cy='73' r='1'/%3E%3Ccircle cx='53' cy='103' r='1.3'/%3E%3Ccircle cx='83' cy='63' r='0.8'/%3E%3Ccircle cx='113' cy='133' r='1.5'/%3E%3Ccircle cx='143' cy='93' r='1'/%3E%3Ccircle cx='173' cy='163' r='1.2'/%3E%3Ccircle cx='33' cy='143' r='1'/%3E%3Ccircle cx='63' cy='173' r='0.8'/%3E%3Ccircle cx='93' cy='153' r='1.3'/%3E%3Ccircle cx='123' cy='183' r='1'/%3E%3Ccircle cx='153' cy='123' r='0.8'/%3E%3Ccircle cx='183' cy='143' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: "#0b141a",
        }}
      >
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-3">
              <span className="bg-[#182229] text-[#8696a0] text-[12px] px-3 py-1 rounded-lg shadow-sm">
                {date}
              </span>
            </div>

            {/* Messages */}
            {msgs.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={
                  msg.senderId?._id === user?._id || msg.senderId === user?._id
                }
              />
            ))}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-[#182229] text-[#8696a0] text-[13px] px-4 py-2 rounded-lg shadow-sm text-center">
              <p>No messages yet.</p>
              <p className="mt-1">Say hello! 👋</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview Bar */}
      {media && (
        <div className="px-4 py-3 bg-[#1a2831] border-t border-[#222d34] flex items-center gap-3">
          {/* Preview thumbnail */}
          <div className="relative flex-shrink-0">
            {media.type.startsWith("image/") && mediaPreview ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-[#374045]"
              />
            ) : media.type.startsWith("video/") && mediaPreview ? (
              <video
                src={mediaPreview}
                className="w-16 h-16 object-cover rounded-lg border border-[#374045]"
              />
            ) : (
              <div className="w-16 h-16 bg-[#2a3942] rounded-lg border border-[#374045] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#8696a0]">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              </div>
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-[#e9edef] text-[14px] truncate">{media.name}</p>
            <p className="text-[#8696a0] text-[12px]">
              {getFileTypeLabel(media)} • {formatFileSize(media.size)}
            </p>
          </div>

          {/* Cancel button */}
          <button
            onClick={clearMedia}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors flex-shrink-0"
            title="Remove"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#8696a0]">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          {/* Send media button */}
          <button
            onClick={handleSendMedia}
            disabled={uploading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#00a884] hover:bg-[#06cf9c] transition-colors flex-shrink-0 disabled:opacity-50"
            title="Send"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-white">
                <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="h-[62px] px-4 flex items-center gap-2 bg-[#202c33]">
        {/* Emoji */}
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors">
          <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-[#8696a0]">
            <path d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.089-5.551-1.754 2.03-4.429 3.395-6.089 3.395-1.66 0-4.335-1.365-6.063-3.395zm3.204-1.362c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm5.694 0c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
          </svg>
        </button>

        {/* Attachment */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-[#8696a0]">
            <path d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.171 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          onChange={handleFileSelect}
        />

        {/* Input */}
        <form onSubmit={onSend} className="flex-1 flex items-center">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message"
            className="w-full bg-[#2a3942] text-[#d1d7db] placeholder-[#8696a0] text-[14px] px-4 py-2.5 rounded-lg outline-none"
          />
        </form>

        {/* Send / Mic */}
        {messageText.trim() ? (
          <button
            onClick={onSend}
            disabled={sending}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-[26px] h-[26px] fill-[#8696a0]"
            >
              <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
            </svg>
          </button>
        ) : (
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-[26px] h-[26px] fill-[#8696a0]"
            >
              <path d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.238 6.002s-6.238-2.471-6.238-6.002H4.761c0 4.001 3.178 7.297 7.061 7.885v3.884h.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-1z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatArea;