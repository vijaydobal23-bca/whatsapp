import { Server } from "socket.io";
import Message from "../models/message.model.js";
import chatModel from "../models/chat.models.js";

// track online users: userId -> socketId
const onlineUsers = new Map();

export const getReceiverSocketId = (userId) => {
  return onlineUsers.get(userId);
};

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`User connected: ${userId} -> ${socket.id}`);
    }

    // broadcast online users to all clients
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    // ---- SEND MESSAGE ----
    socket.on("sendMessage", async (data) => {
      try {
        const { senderId, receiverId, chatId, textMessage, messageType, imageUrl, videoUrl, fileUrl } = data;

        // find or create chat
        let chat;
        if (chatId) {
          chat = await chatModel.findById(chatId);
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

        // create message in db
        const message = await Message.create({
          chatId: chat._id,
          senderId,
          receiverId,
          textMessage,
          messageType: messageType || "text",
          imageUrl,
          videoUrl,
          fileUrl,
          messageStatus: "sent",
        });

        // update chat's last message
        chat.lastMessage = message._id;
        chat.lastMessageAt = message.createdAt;
        await chat.save();

        // populate sender info for the frontend
        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "username profilePicture")
          .populate("receiverId", "username profilePicture");

        // send to receiver if online
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
          io.to(receiverSocketId).emit("chatUpdated", {
            chatId: chat._id,
            lastMessage: populatedMessage,
          });
        }

        // send confirmation back to sender
        socket.emit("messageSent", populatedMessage);
      } catch (error) {
        console.log("error in sendMessage socket:", error);
        socket.emit("messageError", { error: error.message });
      }
    });

    // ---- TYPING INDICATORS ----
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { senderId });
      }
    });

    // ---- MARK MESSAGES AS READ ----
    socket.on("markAsRead", async ({ chatId, userId }) => {
      try {
        await Message.updateMany(
          { chatId, receiverId: userId, messageStatus: { $ne: "read" } },
          { $set: { messageStatus: "read" } }
        );

        // notify the sender that their messages were read
        const chat = await chatModel.findById(chatId);
        if (chat) {
          const otherParticipant = chat.participants.find(
            (p) => p.toString() !== userId
          );
          const otherSocketId = getReceiverSocketId(otherParticipant?.toString());
          if (otherSocketId) {
            io.to(otherSocketId).emit("messagesRead", { chatId, readBy: userId });
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
          const receiverSocketId = getReceiverSocketId(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", { messageId });
          }
          socket.emit("messageDeleted", { messageId });
        }
      } catch (error) {
        console.log("error in deleteMessage socket:", error);
      }
    });

    // ---- DISCONNECT ----
    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
      }
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};
