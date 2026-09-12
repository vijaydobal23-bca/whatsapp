import React, { useEffect, useRef } from 'react';
import { useCalling } from '../hooks/useCalling';
import { useAuth } from '../../auth/hooks/useAuth';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const CallingInterface = () => {
  const {
    callStatus,
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    callDuration,
    callError,
    acceptCall,
    rejectCall,
    endCall,
    cancelCall,
    toggleMute,
    toggleCamera,
  } = useCalling();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

  if (callStatus === "IDLE") return null;

  const isIncoming = callStatus === "INCOMING_CALL";
  const isOutgoing = callStatus === "OUTGOING_CALL";
  const isConnected = callStatus === "CONNECTED";
  
  // Identify the other user
  const otherName = activeCall?.callerName || activeCall?.recipientName || "Unknown User";
  const otherPic = activeCall?.callerProfilePicture || activeCall?.recipientProfilePicture;
  const isVideo = activeCall?.callType === "video";

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0b141a] flex flex-col items-center justify-center font-sans">
      {/* Remote Video Background for Video Calls */}
      {isConnected && isVideo && (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay content */}
      <div className="relative z-10 w-full h-full max-w-md mx-auto flex flex-col items-center py-12 px-6 justify-between">
        
        {/* Header / Info */}
        <div className="flex flex-col items-center text-center mt-10">
          {(!isConnected || !isVideo) && (
            <div className="w-32 h-32 rounded-full overflow-hidden bg-[#202c33] mb-6 shadow-xl border-4 border-[#182229]">
              {otherPic ? (
                <img src={otherPic} alt={otherName} className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-full h-full p-4 fill-[#8696a0]">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>
          )}
          <h2 className="text-white text-3xl font-light tracking-wide mb-2 drop-shadow-md">
            {otherName}
          </h2>
          <p className="text-[#8696a0] text-lg font-medium drop-shadow-md">
            {isIncoming && `Incoming ${isVideo ? 'Video' : 'Voice'} Call`}
            {isOutgoing && "Calling..."}
            {isConnected && formatTime(callDuration)}
          </p>
          {callError && (
            <p className="text-white mt-4 bg-red-500/80 px-4 py-2 rounded-lg text-sm">
              {callError}
            </p>
          )}
        </div>

        {/* Local Video Picture-in-Picture */}
        {isConnected && isVideo && (
          <div className="absolute top-6 right-6 w-28 h-40 bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-[#202c33]">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6 mb-10">
          {isIncoming && (
            <>
              <button
                onClick={rejectCall}
                className="w-16 h-16 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white transform rotate-[135deg]">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </button>
              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-[#22c55e] hover:bg-[#16a34a] flex items-center justify-center transition-transform hover:scale-105 shadow-lg animate-pulse"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </button>
            </>
          )}

          {isOutgoing && (
            <button
              onClick={cancelCall}
              className="w-16 h-16 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white transform rotate-[135deg]">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </button>
          )}

          {isConnected && (
            <>
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                  isMuted ? 'bg-white text-[#0b141a]' : 'bg-[#202c33] text-white hover:bg-[#374045]'
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  {isMuted ? (
                    <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6 6V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                  ) : (
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                  )}
                </svg>
              </button>

              {/* Video Button */}
              {isVideo && (
                <button
                  onClick={toggleCamera}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                    isCameraOff ? 'bg-white text-[#0b141a]' : 'bg-[#202c33] text-white hover:bg-[#374045]'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    {isCameraOff ? (
                      <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
                    ) : (
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                    )}
                  </svg>
                </button>
              )}

              {/* End Call */}
              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white transform rotate-[135deg]">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallingInterface;