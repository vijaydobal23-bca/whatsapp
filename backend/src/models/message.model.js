import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    textMessage: {
      type: String,
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },

    imageUrl: {
      type: String,
    },

    videoUrl: {
      type: String,
    },

    fileUrl: {
      type: String,
    },

    messageStatus: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },

    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chatId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;