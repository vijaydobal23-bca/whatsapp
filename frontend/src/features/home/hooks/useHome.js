import { useCallback, useContext, useEffect } from "react";
import HomeContext from "../homeContext.jsx";
import {
  getMyChats,
  getMyContacts,
  addNewContact as addNewContactApi,
  searchUsers as searchUsersApi,
  getChatMessages as getChatMessagesApi,
  sendMessage as sendMessageApi,
  removeContact as removeContactApi,
  updateProfile as updateProfileApi,
} from "../api/home.api.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useSocket } from "../../../context/socket.context.js";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value._id?.toString?.() || "";
  return value.toString();
};

const isSameId = (left, right) => {
  const leftId = getId(left);
  const rightId = getId(right);
  return Boolean(leftId && rightId && leftId === rightId);
};

const normalizeSocketPayload = (payload) => {
  if (payload?.message) return payload;
  return { message: payload, chat: payload?.chat };
};

const sortChatsByActivity = (items) => {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.lastMessageAt || a.updatedAt || 0).getTime();
    const bTime = new Date(b.lastMessageAt || b.updatedAt || 0).getTime();
    return bTime - aTime;
  });
};

export const useHome = () => {
  const { user, setUser } = useAuth();
  const { socket, onlineUsers, connected: socketConnected } = useSocket();
  const {
    chats,
    setChats,
    contacts,
    setContacts,
    loading,
    setLoading,
    selectedChat,
    setSelectedChat,
    messages,
    setMessages,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
  } = useContext(HomeContext);

  // Fetch all chats
  const fetchAllChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyChats();
      setChats(response?.chats || []);
    } catch (error) {
      console.log("error in fetchAllChats", error);
    } finally {
      setLoading(false);
    }
  }, [setChats, setLoading]);

  // Fetch all contacts
  const fetchAllContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyContacts();
      setContacts(response?.contacts || []);
    } catch (err) {
      console.log("error in fetchAllContacts", err);
    } finally {
      setLoading(false);
    }
  }, [setContacts, setLoading]);

  const upsertChat = useCallback(
    (chat) => {
      if (!chat?._id) return;

      setChats((prev) => {
        const filtered = prev.filter((item) => !isSameId(item._id, chat._id));
        return sortChatsByActivity([chat, ...filtered]);
      });
    },
    [setChats]
  );

  const appendMessage = useCallback(
    (newMessage) => {
      if (!newMessage?._id) return;

      setMessages((prev) => {
        const alreadyExists = prev.some((message) =>
          isSameId(message._id, newMessage._id)
        );

        return alreadyExists ? prev : [...prev, newMessage];
      });
    },
    [setMessages]
  );

  // Add a new contact
  const addContact = async (contactId) => {
    try {
      setLoading(true);
      await addNewContactApi(contactId);
      await fetchAllContacts();
    } catch (err) {
      console.log("error in addContact", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove a contact
  const deleteContact = async (contactId) => {
    try {
      setLoading(true);
      await removeContactApi(contactId);
      await fetchAllContacts();
    } catch (err) {
      console.log("error in deleteContact", err);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchForUsers = async (query) => {
    try {
      if (!query || query.trim().length === 0) {
        setSearchResults([]);
        return;
      }
      const response = await searchUsersApi(query);
      setSearchResults(response?.users || []);
    } catch (err) {
      console.log("error in searchForUsers", err);
    }
  };

  // Get messages for selected chat
  const fetchMessages = useCallback(async (chatId) => {
    try {
      const response = await getChatMessagesApi(chatId);
      setMessages(response?.messages || []);
    } catch (err) {
      console.log("error in fetchMessages", err);
    }
  }, [setMessages]);

  // Get the other participant in a chat
  const getOtherParticipant = useCallback(
    (chat) => {
      if (!chat || !user) return null;
      return chat.participants?.find((p) => !isSameId(p, user._id)) || chat.participants?.[0];
    },
    [user]
  );

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    const messageBelongsToSelectedChat = (message) => {
      if (!selectedChat || !message) return false;

      if (selectedChat._id && isSameId(selectedChat._id, message.chatId)) {
        return true;
      }

      const otherParticipant = getOtherParticipant(selectedChat);
      return (
        selectedChat.isNewChat &&
        (isSameId(otherParticipant, message.senderId) ||
          isSameId(otherParticipant, message.receiverId))
      );
    };

    const handleMessagePayload = (payload) => {
      const { message: newMessage, chat: updatedChat } =
        normalizeSocketPayload(payload);

      if (updatedChat) {
        upsertChat(updatedChat);
      }

      if (!messageBelongsToSelectedChat(newMessage)) return;

      if (updatedChat && !isSameId(selectedChat?._id, updatedChat._id)) {
        setSelectedChat(updatedChat);
      }

      appendMessage(newMessage);

      if (!isSameId(newMessage?.senderId, user?._id)) {
        socket.emit("markAsRead", { chatId: updatedChat?._id || newMessage.chatId });
      }
    };

    const handleChatUpdated = (payload) => {
      if (payload?.chat) {
        upsertChat(payload.chat);
      } else {
        fetchAllChats();
      }
    };

    const handleMessagesRead = ({ chatId, readBy }) => {
      setMessages((prev) =>
        prev.map((message) =>
          isSameId(message.chatId, chatId) && !isSameId(message.senderId, readBy)
            ? { ...message, messageStatus: "read" }
            : message
        )
      );

      setChats((prev) =>
        prev.map((chat) =>
          isSameId(chat._id, chatId) && chat.lastMessage
            ? {
                ...chat,
                lastMessage: { ...chat.lastMessage, messageStatus: "read" },
              }
            : chat
        )
      );
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((message) => !isSameId(message._id, messageId))
      );
      fetchAllChats();
    };

    const handleUserStatusChanged = ({ userId, status, lastSeen }) => {
      const patchUserStatus = (item) =>
        isSameId(item, userId)
          ? { ...item, status, lastSeen: lastSeen || item.lastSeen }
          : item;

      setContacts((prev) =>
        prev.map((contact) => ({
          ...contact,
          contactUser: patchUserStatus(contact.contactUser),
        }))
      );

      setChats((prev) =>
        prev.map((chat) => ({
          ...chat,
          participants: chat.participants?.map(patchUserStatus) || [],
        }))
      );

      setSelectedChat((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants?.map(patchUserStatus) || [],
            }
          : prev
      );
    };

    const handleMessageError = ({ error }) => {
      console.log("socket message error", error);
    };

    socket.on("receiveMessage", handleMessagePayload);
    socket.on("chatUpdated", handleChatUpdated);
    socket.on("messageSent", handleMessagePayload);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("userStatusChanged", handleUserStatusChanged);
    socket.on("messageError", handleMessageError);

    return () => {
      socket.off("receiveMessage", handleMessagePayload);
      socket.off("chatUpdated", handleChatUpdated);
      socket.off("messageSent", handleMessagePayload);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("userStatusChanged", handleUserStatusChanged);
      socket.off("messageError", handleMessageError);
    };
  }, [
    appendMessage,
    fetchAllChats,
    getOtherParticipant,
    selectedChat,
    setChats,
    setContacts,
    setMessages,
    setSelectedChat,
    socket,
    upsertChat,
    user?._id,
  ]);


  // Send a message via Socket
  const handleSendMessage = async (receiverId, textMessage, messageType, imageUrl, videoUrl, fileUrl) => {
    try {
      if (socket?.connected) {
        await new Promise((resolve, reject) => {
          socket.timeout(10000).emit("sendMessage", {
            receiverId,
            chatId: selectedChat?._id,
            textMessage,
            messageType,
            imageUrl,
            videoUrl,
            fileUrl,
          }, (error, response) => {
            if (error) {
              reject(new Error("Message send timed out"));
              return;
            }

            if (!response?.ok) {
              reject(new Error(response?.error || "Message failed to send"));
              return;
            }

            if (response.chat && selectedChat?.isNewChat) {
              setSelectedChat(response.chat);
            }

            resolve(response);
          });
        });
      } else {
        // Fallback to REST API if socket is disconnected
        const response = await sendMessageApi(receiverId, textMessage, messageType, imageUrl, videoUrl, fileUrl);
        if (response?.chat) {
          upsertChat(response.chat);
          setSelectedChat(response.chat);
        } else {
          await fetchAllChats();
        }

        if (response?.sentMessage) {
          appendMessage(response.sentMessage);
        } else if (response?.chat?._id) {
          await fetchMessages(response.chat._id);
        }
      }
    } catch (err) {
      console.log("error in handleSendMessage", err);
    }
  };

  // Select a chat and load its messages
  const selectChat = async (chat) => {
    setSelectedChat(chat);
    setMessages([]);

    if (chat?._id) {
      await fetchMessages(chat._id);
      if (socket?.connected) {
        socket.emit("markAsRead", { chatId: chat._id });
      }
    }
  };

  // Update user profile
  const handleUpdateProfile = async ({ username, bio, profilePicture }) => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (username) formData.append("username", username);
      if (bio !== undefined) formData.append("bio", bio);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const response = await updateProfileApi(formData);
      if (response?.user) {
        setUser(response.user);
      }
      return response;
    } catch (err) {
      console.log("error in handleUpdateProfile", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    chats,
    contacts,
    loading,
    selectedChat,
    messages,
    searchQuery,
    setSearchQuery,
    searchResults,
    fetchAllChats,
    fetchAllContacts,
    addContact,
    deleteContact,
    searchForUsers,
    fetchMessages,
    handleSendMessage,
    selectChat,
    setSelectedChat,
    getOtherParticipant,
    handleUpdateProfile,
    onlineUsers,
    socket,
    socketConnected,
  };
};
