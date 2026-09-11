import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import contactRouter from "./routes/contact.routes.js";
import { initSocket } from "./socket/socket.js";

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

// initialize socket.io
initSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: clientOrigin,
  credentials:true
}));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/contact", contactRouter);

export default server;
