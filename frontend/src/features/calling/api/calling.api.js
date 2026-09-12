import axios from "axios";

const apiCalling = axios.create({
  baseURL: "https://whatsapp-djq6.onrender.com",
  withCredentials: true,
});

export const initiateCallApi = async ({ recipientId, callType }) => {
  const response = await apiCalling.post("/api/calling", { recipientId, callType });
  return response.data;
};

export const handleCallResponseApi = async ({ callId, status, callDuration }) => {
  const response = await apiCalling.post("/api/calling/response", { callId, status, callDuration });
  return response.data;
};

export const getCallHistoryApi = async () => {
  const response = await apiCalling.get("/api/calling/callhistory");
  return response.data;
};
