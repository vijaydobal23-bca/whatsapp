const groupChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    groupAvatar: {
      type: String,
    },

    isGroupAdmin: {
      type: Boolean,
      default: false,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GroupChat = mongoose.model("GroupChat", groupChatSchema);

export default GroupChat;