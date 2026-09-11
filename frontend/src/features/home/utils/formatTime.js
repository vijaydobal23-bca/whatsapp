/**
 * Format a date for the chat list (sidebar).
 * - Today: show time (e.g., "8:45 pm")
 * - Yesterday: show "Yesterday"
 * - This week: show day name (e.g., "Tuesday")
 * - Older: show date (e.g., "02/09/2026")
 */
export const formatChatTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isYesterday) {
    return "Yesterday";
  }

  // Check if within this week (last 7 days)
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString("en-IN", { weekday: "long" });
  }

  // Older dates
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format a date for message bubbles.
 * Shows time in "h:mm am/pm" format.
 */
export const formatMessageTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
