import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

import authRouter from "./routes/auth.routes.js";
import chatRouter from "./routes/chat.routes.js";
import contactRouter from "./routes/contact.routes.js";
import storyRouter from "./routes/status.routes.js";
import callingRouter from "./routes/calling.routes.js";
import { initSocket } from "./socket/socket.js";

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "too many request",
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: "too many request",
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

const callLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2,
  message: "too many request",
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});

// initialize socket.io
initSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
app.use(limiter);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.use("/api/auth", authRouter);

app.use("/api/chat", chatRouter);
app.use("/api/contact", contactRouter);
app.use("/api/status", storyRouter);
app.use("/api/calling", callLimiter, callingRouter);

export default server;
