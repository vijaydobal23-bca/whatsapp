import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../features/auth/hooks/useAuth";
import { SocketContext } from "./socket.context.js";

const socketUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const SocketContextProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { user, loading } = useAuth();

  const socket = useMemo(() => {
    if (loading || !user?._id) return null;

    return io(socketUrl, {
      auth: { userId: user._id },
      query: { userId: user._id },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
    });
  }, [loading, user?._id]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleConnect = () => {
      setConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setConnected(false);
      setOnlineUsers([]);
    };

    const handleConnectError = (error) => {
      setConnected(false);
      setConnectionError(error.message);
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(Array.isArray(users) ? users.map(String) : []);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("getOnlineUsers", handleOnlineUsers);

    return () => {
      socket.disconnect();
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("getOnlineUsers", handleOnlineUsers);
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{ socket, onlineUsers, connected, connectionError }}
    >
      {children}
    </SocketContext.Provider>
  );
};
