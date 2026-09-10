import chatModel from "../models/chat.models.js";
import Message from "../models/message.model.js";

export const createChat = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, messageType, textMessage, imageUrl, videoUrl, fileUrl } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "All fields are required" });
    }

   
    let chat = await chatModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await chatModel.create({
        participants: [senderId, receiverId],
      });
    }
    if (textMessage || imageUrl || videoUrl || fileUrl) {
      const message = await Message.create({
        chatId: chat._id,
        senderId,
        receiverId,
        messageType: messageType || "text",
        textMessage,
        imageUrl,
        videoUrl,
        fileUrl,
      });

      chat.lastMessage = message._id;
      chat.lastMessageAt = message.createdAt;
      await chat.save();
    }

    return res.status(200).json({ message: "Chat created successfully", chat });
  } catch (error) {
    console.log("error in createChat", error);
    return res.status(500).json({ message: error.message });
  }
};


export const getAllChats = async(req ,res)=>{
  try {
    const senderId = req.user.userId;
    const chats = await chatModel.find({
      participants: { $all: [senderId] },
    })

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