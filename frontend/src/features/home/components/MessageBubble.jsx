import { formatMessageTime } from "../utils/formatTime";

const MessageBubble = ({ message, isOwn }) => {
  const time = formatMessageTime(message.createdAt);

  // Message status icon for sent messages
  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.messageStatus) {
      case "read":
        return (
          <svg viewBox="0 0 16 11" className="w-[16px] h-[11px] fill-[#53bdeb] ml-1 flex-shrink-0">
            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.344.153l-.311.339a.514.514 0 0 0 0 .693l2.735 2.852a.454.454 0 0 0 .65 0l.286-.303 6.538-8.069a.477.477 0 0 0 .003-.68l-.336-.349z" />
            <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.009-1.052-.397.397 1.429 1.491a.454.454 0 0 0 .65 0l.286-.303 6.538-8.069a.477.477 0 0 0 .003-.68l-.336-.349z" />
          </svg>
        );
      case "delivered":
        return (
          <svg viewBox="0 0 16 11" className="w-[16px] h-[11px] fill-[#8696a0] ml-1 flex-shrink-0">
            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.344.153l-.311.339a.514.514 0 0 0 0 .693l2.735 2.852a.454.454 0 0 0 .65 0l.286-.303 6.538-8.069a.477.477 0 0 0 .003-.68l-.336-.349z" />
            <path d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.009-1.052-.397.397 1.429 1.491a.454.454 0 0 0 .65 0l.286-.303 6.538-8.069a.477.477 0 0 0 .003-.68l-.336-.349z" />
          </svg>
        );
      case "sent":
        return (
          <svg viewBox="0 0 12 11" className="w-[14px] h-[11px] fill-[#8696a0] ml-1 flex-shrink-0">
            <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.463.463 0 0 0-.336-.153.457.457 0 0 0-.344.153l-.311.339a.514.514 0 0 0 0 .693l2.735 2.852a.454.454 0 0 0 .65 0l.286-.303 6.538-8.069a.477.477 0 0 0 .003-.68l-.336-.349z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Render content based on message type
  const renderContent = () => {
    switch (message.messageType) {
      case "image":
        return (
          <div className="mb-1">
            <img
              src={message.imageUrl}
              alt="Photo"
              className="rounded-lg max-w-[330px] max-h-[330px] object-cover"
            />
            {message.textMessage && (
              <p className="text-[#e9edef] text-[14.2px] mt-1 leading-[19px]">
                {message.textMessage}
              </p>
            )}
          </div>
        );

      case "video":
        return (
          <div className="mb-1">
            <video
              src={message.videoUrl}
              controls
              className="rounded-lg max-w-[330px] max-h-[330px]"
            />
            {message.textMessage && (
              <p className="text-[#e9edef] text-[14.2px] mt-1 leading-[19px]">
                {message.textMessage}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div className="flex items-center gap-2 mb-1 p-2 bg-[#12262f] rounded-lg">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#8696a0] flex-shrink-0">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#53bdeb] text-[13px] underline truncate"
            >
              Document
            </a>
          </div>
        );

      default:
        return (
          <p className="text-[#e9edef] text-[14.2px] leading-[19px] whitespace-pre-wrap break-words">
            {message.textMessage}
          </p>
        );
    }
  };

  return (
    <div className={`flex mb-[2px] ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[65%] px-[9px] pt-[6px] pb-[8px] rounded-lg shadow-sm ${
          isOwn
            ? "bg-[#005c4b] rounded-tr-none"
            : "bg-[#202c33] rounded-tl-none"
        }`}
      >
        {/* Tail */}
        <span
          className={`absolute top-0 w-[8px] h-[13px] ${
            isOwn ? "-right-[8px]" : "-left-[8px]"
          }`}
        >
          <svg viewBox="0 0 8 13" className="w-full h-full">
            {isOwn ? (
              <path fill="#005c4b" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
            ) : (
              <path fill="#202c33" d="M6.467 3.568L0 12.193V1h5.188c1.77 0 2.338 1.156 1.279 2.568z" />
            )}
          </svg>
        </span>

        {/* Content */}
        {renderContent()}

        {/* Time and status */}
        <div className="flex items-center justify-end gap-0.5 -mb-[4px] mt-[2px]">
          <span className="text-[#ffffff99] text-[11px] leading-none">
            {time}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
