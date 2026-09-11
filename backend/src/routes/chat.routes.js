import express from "express";
import { createChat, getAllChats, deleteMessage, getChatMessages, sendMediaMessage } from "../controllers/chat.controller.js";
import { identifyUser } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/create", identifyUser, createChat);

router.post("/send-media", identifyUser, upload.single("media"), sendMediaMessage);

router.get("/all-chats", identifyUser, getAllChats);

router.delete("/delete-message", identifyUser, deleteMessage);

router.get("/:chatId/messages", identifyUser, getChatMessages);

export default router;