import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import chatModel from "../models/chat.models.js";
import contactModel from "../models/contact.model.js";
import userModel from "../models/user.model.js";
import { config } from "../config/config.js";
import redis from "../redis/redis.js";

// track online users: userId -> Set<socketId>
const onlineUsers = new Map();
let ioInstance = null;

const deleteCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    console.log("Redis cache deletion error:", err);
  }
};

const clientOrigin = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://whatsapp-chi-mocha.vercel.app"
];

const normalizeId = (id) => id?.toString();

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (!name) return cookies;

    cookies[name] = decodeURIComponent(valueParts.join("="));
    return cookies;
  }, {});
};

const addOnlineSocket = (userId, socketId) => {
  const id = normalizeId(userId);
  if (!onlineUsers.has(id)) {
    onlineUsers.set(id, new Set());
  }

  onlineUsers.get(id).add(socketId);
};

const removeOnlineSocket = (userId, socketId) => {
  const id = normalizeId(userId);
  const sockets = onlineUsers.get(id);
  if (!sockets) return false;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(id);
    return true;
  }

  return false;
};

const getOnlineUserIds = () => Array.from(onlineUsers.keys());

export const getReceiverSocketIds = (userId) => {
  return Array.from(onlineUsers.get(normalizeId(userId)) || []);
};

export const getReceiverSocketId = (userId) => {
  return getReceiverSocketIds(userId)[0];
};

export const emitToUser = (io, userId, event, payload) => {
  getReceiverSocketIds(userId).forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
};

export const getIO = () => ioInstance;

const emitPresence = (io, userId, status, lastSeen = null) => {
  io.emit("getOnlineUsers", getOnlineUserIds());
  io.emit("userStatusChanged", {
    userId: normalizeId(userId),
    status,
    lastSeen,
  });
};

const authenticateSocket = async (socket) => {
  const cookies = parseCookies(socket.handshake.headers.cookie);
  const refreshToken = cookies.refreshToken;

  if (refreshToken) {
    const decodedToken = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    const user = await userModel.findById(decodedToken.userId).select("_id");
    if (!user) {
      throw new Error("Unauthorized");
    }

    return user;
  }

  const fallbackUserId =
    socket.handshake.auth?.userId || socket.handshake.query?.userId;

  if (!fallbackUserId) {
    throw new Error("Unauthorized");
  }

  const user = await userModel.findById(fallbackUserId).select("_id");
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};

const getPopulatedChat = (chatId) => {
  return chatModel
    .findById(chatId)
    .populate("participants", "username email profilePicture status bio lastSeen")
    .populate(
      "lastMessage",
      "textMessage messageType imageUrl videoUrl fileUrl senderId receiverId messageStatus createdAt"
    );
};

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.data.userId = normalizeId(user._id);
      next();
    } catch (error) {
      next(new Error(error.message || "Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;

    addOnlineSocket(userId, socket.id);
    await userModel.findByIdAndUpdate(userId, { status: "online" }).catch(() => {});
    console.log(`User connected: ${userId} -> ${socket.id}`);

    emitPresence(io, userId, "online");

    // ---- SEND MESSAGE ----
    socket.on("sendMessage", async (data, callback) => {
      const reply = typeof callback === "function" ? callback : () => {};

      try {
        const senderId = userId;
        const {
          receiverId,
          chatId,
          textMessage,
          messageType,
          imageUrl,
          videoUrl,
          fileUrl,
        } = data || {};

        const cleanText =
          typeof textMessage === "string" ? textMessage.trim() : textMessage;
        const hasContent = cleanText || imageUrl || videoUrl || fileUrl;

        if (!receiverId || !hasContent) {
          throw new Error("Receiver and message content are required");
        }

        const isContact = await contactModel.findOne({
          owner: senderId,
          contactUser: receiverId,
        });

        if (!isContact) {
          throw new Error("You must add this user to your contacts before messaging");
        }

        // find or create chat
        let chat;
        if (chatId) {
          chat = await chatModel.findOne({
            _id: chatId,
            participants: { $all: [senderId, receiverId] },
          });
        } else {
          chat = await chatModel.findOne({
            participants: { $all: [senderId, receiverId] },
          });

          if (!chat) {
            chat = await chatModel.create({
              participants: [senderId, receiverId],
            });
          }
        }

        if (!chat) {
          throw new Error("Chat not found");
        }

        const receiverSocketIds = getReceiverSocketIds(receiverId);

        // create message in db
        const message = await Message.create({
          chatId: chat._id,
          senderId,
          receiverId,
          textMessage: cleanText,
          messageType: messageType || "text",
          imageUrl,
          videoUrl,
          fileUrl,
          messageStatus: receiverSocketIds.length > 0 ? "delivered" : "sent",
        });

        // update chat's last message
        chat.lastMessage = message._id;
        chat.lastMessageAt = message.createdAt;
        await chat.save();

        // Invalidate Redis cache
        await deleteCache(`messages:${chat._id}:*`);
        await deleteCache(`chats:${senderId}:*`);
        await deleteCache(`chats:${receiverId}:*`);

        // populate sender info for the frontend
        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "username profilePicture")
          .populate("receiverId", "username profilePicture");
        const populatedChat = await getPopulatedChat(chat._id);
        const payload = {
          message: populatedMessage,
          chat: populatedChat,
        };

        emitToUser(io, receiverId, "receiveMessage", payload);
        emitToUser(io, receiverId, "chatUpdated", { chat: populatedChat });
        emitToUser(io, senderId, "messageSent", payload);
        emitToUser(io, senderId, "chatUpdated", { chat: populatedChat });
        reply({ ok: true, ...payload });
      } catch (error) {
        console.log("error in sendMessage socket:", error);
        socket.emit("messageError", { error: error.message });
        reply({ ok: false, error: error.message });
      }
    });

    // ---- TYPING INDICATORS ----
    socket.on("typing", ({ receiverId }) => {
      emitToUser(io, receiverId, "userTyping", { senderId: userId });
    });

    socket.on("stopTyping", ({ receiverId }) => {
      emitToUser(io, receiverId, "userStoppedTyping", { senderId: userId });
    });

    // ---- MARK MESSAGES AS READ ----
    socket.on("markAsRead", async ({ chatId }) => {
      try {
        await Message.updateMany(
          { chatId, receiverId: userId, messageStatus: { $ne: "read" } },
          { $set: { messageStatus: "read" } }
        );

        // Invalidate Redis cache
        await deleteCache(`messages:${chatId}:*`);
        const chat = await chatModel.findById(chatId);
        if (chat) {
          await deleteCache(`chats:${chat.participants[0]}:*`);
          await deleteCache(`chats:${chat.participants[1]}:*`);
          
          const otherParticipant = chat.participants.find(
            (p) => p.toString() !== userId
          );
          if (otherParticipant) {
            emitToUser(io, otherParticipant, "messagesRead", { chatId, readBy: userId });
          }
        }
      } catch (error) {
        console.log("error in markAsRead socket:", error);
      }
    });

    // ---- DELETE MESSAGE ----
    socket.on("deleteMessage", async ({ messageId, receiverId }) => {
      try {
        const message = await Message.findByIdAndDelete(messageId);
        if (message) {
          // Invalidate Redis cache
          await deleteCache(`messages:${message.chatId}:*`);
          await deleteCache(`chats:${message.senderId}:*`);
          await deleteCache(`chats:${message.receiverId}:*`);

          emitToUser(io, receiverId, "messageDeleted", { messageId });
          socket.emit("messageDeleted", { messageId });
        }
      } catch (error) {
        console.log("error in deleteMessage socket:", error);
      }
    });

    // ---- DISCONNECT ----
    socket.on("disconnect", async () => {
      const wasLastSocket = removeOnlineSocket(userId, socket.id);

      if (wasLastSocket) {
        const lastSeen = new Date();
        await userModel
          .findByIdAndUpdate(userId, { status: "offline", lastSeen })
          .catch(() => {});

        console.log(`User disconnected: ${userId}`);
        emitPresence(io, userId, "offline", lastSeen);
      } else {
        io.emit("getOnlineUsers", getOnlineUserIds());
      }
    });


    // ---- CALLING (WebRTC + Socket.IO) ----
    socket.on("startCall", ({ recipientId, callType, offer }) => {
      const recipientSocketId = getReceiverSocketId(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("incomingCall", { 
          callerId: userId, 
          callType, 
          offer 
        });
      } else {
        // User offline
        socket.emit("callRejected", { calleeId: recipientId, reason: "offline" });
      }
    });

    socket.on("callAccepted", ({ callerId, answer }) => {
      const callerSocketId = getReceiverSocketId(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit("callAccepted", { calleeId: userId, answer });
      }
    });

    socket.on("callRejected", ({ callerId }) => {
      const callerSocketId = getReceiverSocketId(callerId);
      if (callerSocketId) {
        io.to(callerSocketId).emit("callRejected", { calleeId: userId, reason: "rejected" });
      }
    });

    socket.on("iceCandidate", ({ targetId, candidate }) => {
      const targetSocketId = getReceiverSocketId(targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("iceCandidate", { senderId: userId, candidate });
      }
    });

    socket.on("endCall", ({ targetId }) => {
      const targetSocketId = getReceiverSocketId(targetId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("endCall", { senderId: userId });
      }
    });
  });
  

  return io;
};
