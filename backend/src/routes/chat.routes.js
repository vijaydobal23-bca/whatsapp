import express from "express";
import { createChat, getAllChats, deleteMessage } from "../controllers/chat.controller.js";
import { identifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create", identifyUser, createChat);

router.get("/all-chats", identifyUser, getAllChats);

router.delete("/delete-message", identifyUser, deleteMessage);

export default router;