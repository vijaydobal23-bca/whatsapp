import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ["image", "video"],
        required: true
    },
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // expires in 24 hours
    }
}, { timestamps: true });

const storyModel = mongoose.model("Story", storySchema);
export default storyModel;