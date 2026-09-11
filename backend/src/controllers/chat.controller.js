import chatModel from "../models/chat.models.js";
import Message from "../models/message.model.js";
import contactModel from "../models/contact.model.js";
import { emitToUser, getIO, getReceiverSocketIds } from "../socket/socket.js";

const populateChat = (chatId) => {
  return chatModel
    .findById(chatId)
    .populate("participants", "username email profilePicture status bio lastSeen")
    .populate(
      "lastMessage",
      "textMessage messageType imageUrl videoUrl fileUrl senderId receiverId messageStatus createdAt"
    );
};

const populateMessage = (messageId) => {
  return Message.findById(messageId)
    .populate("senderId", "username email profilePicture status bio lastSeen")
    .populate("receiverId", "username email profilePicture status bio lastSeen");
};

export const createChat = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, messageType, textMessage, imageUrl, videoUrl, fileUrl } = req.body;
    const cleanText = typeof textMessage === "string" ? textMessage.trim() : textMessage;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if receiver is in sender's contacts
    const isContact = await contactModel.findOne({ owner: senderId, contactUser: receiverId });
    if (!isContact) {
      return res.status(403).json({ message: "You must add this user to your contacts before messaging" });
    }

   
    let chat = await chatModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await chatModel.create({
        participants: [senderId, receiverId],
      });
    }
    let populatedMessage = null;
    if (cleanText || imageUrl || videoUrl || fileUrl) {
      const receiverSocketIds = getReceiverSocketIds(receiverId);
      const message = await Message.create({
        chatId: chat._id,
        senderId,
        receiverId,
        messageType: messageType || "text",
        textMessage: cleanText,
        imageUrl,
        videoUrl,
        fileUrl,
        messageStatus: receiverSocketIds.length > 0 ? "delivered" : "sent",
      });

      chat.lastMessage = message._id;
      chat.lastMessageAt = message.createdAt;
      await chat.save();

      populatedMessage = await populateMessage(message._id);
    }

    const populatedChat = await populateChat(chat._id);
    const io = getIO();

    if (io && populatedMessage) {
      const payload = { message: populatedMessage, chat: populatedChat };
      emitToUser(io, receiverId, "receiveMessage", payload);
      emitToUser(io, receiverId, "chatUpdated", { chat: populatedChat });
      emitToUser(io, senderId, "messageSent", payload);
      emitToUser(io, senderId, "chatUpdated", { chat: populatedChat });
    }

    return res.status(200).json({
      message: "Chat created successfully",
      chat: populatedChat,
      sentMessage: populatedMessage,
    });
  } catch (error) {
    console.log("error in createChat", error);
    return res.status(500).json({ message: error.message });
  }
};


export const getAllChats = async(req ,res)=>{
  try {
    const senderId = req.user._id;
    const limit = req.query.limit || 10;
    const skip = req.query.skip || 0;

    const chats = await chatModel.find({
      participants: { $all: [senderId] },
    }).populate("participants", "username email profilePicture status bio lastSeen")
    .populate("lastMessage", "textMessage messageType imageUrl videoUrl fileUrl senderId receiverId messageStatus createdAt")
    .sort({ lastMessageAt: -1 }).limit(limit).skip(skip);

    return res.status(200).json({ message: "Chats fetched successfully", chats });
    
  } catch (error) {
    console.log("error in getAllChats", error);
    return res.status(500).json({ message: error.message });
  }
}

export const deleteMessage = async(req ,res)=>{
  try {
    const {messageId} = req.body;
    if(!messageId){
      return res.status(400).json({message:"All fields are required"});
    }

    const message = await Message.findByIdAndDelete(messageId);
    if(!message){
      return res.status(404).json({message:"Message not found"});
    }

    return res.status(200).json({message:"Message deleted successfully"});
  } catch (error) {
    console.log("error in deleteMessage", error);
    return res.status(500).json({message:error.message});
  }
}

export const getChatMessages = async(req ,res)=>{
  try{

    const {chatId} = req.params;
    const limit = req.query.limit || 10;
    const skip = req.query.skip || 0;
    
    const messages = await Message.find({
      chatId,
    }).populate("senderId", "username email profilePicture status bio lastSeen").sort({ createdAt: 1 }).limit(limit).skip(skip);
    return res.status(200).json({message:"Messages fetched successfully",messages,user:req.user});
    
  }catch(error){
    console.log("error in getChatMessages", error);
    return res.status(500).json({message:error.message});
  }
}
