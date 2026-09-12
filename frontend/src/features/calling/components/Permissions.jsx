export const requestMediaPermissions = async (callType) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });
    return { stream, error: null };
  } catch (err) {
    console.error("Media permission error:", err);
    let errorMessage = "Could not access camera/microphone.";
    if (err.name === "NotAllowedError") {
      errorMessage = "Permission denied for camera/microphone. Please allow access in your browser settings.";
    } else if (err.name === "NotFoundError") {
      errorMessage = "Camera/microphone not found on this device.";
    }
    return { stream: null, error: errorMessage };
  }
};
