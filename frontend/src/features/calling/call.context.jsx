import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import { SocketContext } from "../../context/socket.context";
import { useAuth } from "../auth/hooks/useAuth";
import { requestMediaPermissions } from "./components/Permissions";
import { initiateCallApi, handleCallResponseApi } from "./api/calling.api";

export const CallContext = createContext();

const peerConnectionConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const CallContextProvider = ({ children }) => {
  const { socket } = useContext(SocketContext);
  const { user } = useAuth();

  const [callStatus, setCallStatus] = useState("IDLE");
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callError, setCallError] = useState(null);
  const [callHistory, setCallHistory] = useState([]);

  const pcRef = useRef(null);
  const timerRef = useRef(null);

  const cleanupCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setLocalStream((prevStream) => {
      if (prevStream) {
        prevStream.getTracks().forEach((track) => track.stop());
      }
      return null;
    });
    setRemoteStream(null);
    clearInterval(timerRef.current);

    setCallStatus("IDLE");
    setActiveCall(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
    setCallError(null);
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(peerConnectionConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate && activeCall) {
        const targetId =
          activeCall.callerId === user._id
            ? activeCall.receiverId
            : activeCall.callerId;
        socket?.emit("iceCandidate", { targetId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        cleanupCall();
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const startCall = async (
    recipientId,
    callType,
    recipientName,
    recipientProfilePicture,
  ) => {
    try {
      const { stream, error } = await requestMediaPermissions(callType);
      if (error) {
        setCallError(error);
        setTimeout(() => setCallError(null), 3000);
        return;
      }
      setLocalStream(stream);

      // Create API call record
      const dbCall = await initiateCallApi({ recipientId, callType });

      setActiveCall({
        callId: dbCall._id,
        callerId: user._id,
        receiverId: recipientId,
        callType,
        recipientName,
        recipientProfilePicture,
      });
      setCallStatus("OUTGOING_CALL");

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.emit("startCall", {
        recipientId,
        callType,
        offer,
        callId: dbCall._id,
        callerName: user.username,
        callerProfilePicture: user.profilePicture,
      });
    } catch (err) {
      console.error("Failed to start call", err);
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!activeCall) return;
    try {
      const { stream, error } = await requestMediaPermissions(
        activeCall.callType,
      );
      if (error) {
        setCallError(error);
        rejectCall();
        return;
      }
      setLocalStream(stream);

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (activeCall.offer) {
        await pc.setRemoteDescription(
          new RTCSessionDescription(activeCall.offer),
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket?.emit("callAccepted", { callerId: activeCall.callerId, answer });
      }

      setCallStatus("CONNECTED");
      startTimer();

      if (activeCall.callId) {
        await handleCallResponseApi({
          callId: activeCall.callId,
          status: "accepted",
        });
      }
    } catch (err) {
      console.error("Failed to accept call", err);
      cleanupCall();
    }
  };

  const rejectCall = async () => {
    if (!activeCall) return;
    socket?.emit("callRejected", { callerId: activeCall.callerId });
    if (activeCall.callId) {
      await handleCallResponseApi({
        callId: activeCall.callId,
        status: "rejected",
      });
    }
    cleanupCall();
  };

  const cancelCall = async () => {
    if (!activeCall) return;
    socket?.emit("endCall", { targetId: activeCall.receiverId });
    if (activeCall.callId) {
      await handleCallResponseApi({
        callId: activeCall.callId,
        status: "missed",
      });
    }
    cleanupCall();
  };

  const endCall = async () => {
    if (!activeCall) return;
    const targetId =
      activeCall.callerId === user._id
        ? activeCall.receiverId
        : activeCall.callerId;
    socket?.emit("endCall", { targetId });

    if (activeCall.callId) {
      await handleCallResponseApi({
        callId: activeCall.callId,
        status: "ended",
        callDuration,
      });
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      const {
        callerId,
        callType,
        offer,
        callId,
        callerName,
        callerProfilePicture,
      } = data;
      setCallStatus((currentStatus) => {
        if (currentStatus !== "IDLE") {
          socket.emit("callRejected", { callerId, reason: "busy" });
          return currentStatus;
        }

        setActiveCall({
          callerId,
          receiverId: user._id,
          callType,
          offer,
          callId,
          callerName,
          callerProfilePicture,
        });
        return "INCOMING_CALL";
      });
    };

    const handleCallAccepted = async ({ calleeId, answer }) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
        setCallStatus("CONNECTED");
        startTimer();
      }
    };

    const handleCallRejected = ({ calleeId, reason }) => {
      setCallError(
        reason === "offline"
          ? "User is offline"
          : reason === "busy"
            ? "User is busy"
            : "Call Rejected",
      );
      setTimeout(() => cleanupCall(), 2000);
    };

    const handleIceCandidate = async ({ senderId, candidate }) => {
      if (pcRef.current && pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ice candidate", e);
        }
      }
    };

    const handleEndCall = () => {
      cleanupCall();
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("callRejected", handleCallRejected);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("endCall", handleEndCall);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("callRejected", handleCallRejected);
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("endCall", handleEndCall);
    };
  }, [socket, user?._id]);

  return (
    <CallContext.Provider
      value={{
        callStatus,
        activeCall,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        callDuration,
        callError,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        cancelCall,
        toggleMute,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
