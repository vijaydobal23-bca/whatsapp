import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// Fetch all chats for the logged-in user
export const getMyChats = async () => {
  try {
    const response = await axiosInstance.get("/api/chat/all-chats");
    return response.data;
  } catch (error) {
    console.log("error in getMyChats api", error);
    throw error;
  }
};

// Fetch all contacts for the logged-in user
export const getMyContacts = async () => {
  try {
    const response = await axiosInstance.get("/api/contact/my-contacts");
    return response.data;
  } catch (error) {
    console.log("error in getMyContacts api", error);
    throw error;
  }
};

// Add a new contact by user ID
export const addNewContact = async (contactId) => {
  try {
    const response = await axiosInstance.post(`/api/contact/add/${contactId}`);
    return response.data;
  } catch (error) {
    console.log("error in addNewContact api", error);
    throw error;
  }
};

// Remove a contact
export const removeContact = async (contactId) => {
  try {
    const response = await axiosInstance.delete(`/api/contact/remove/${contactId}`);
    return response.data;
  } catch (error) {
    console.log("error in removeContact api", error);
    throw error;
  }
};

// Search users by username or email
export const searchUsers = async (query) => {
  try {
    const response = await axiosInstance.get(`/api/contact/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.log("error in searchUsers api", error);
    throw error;
  }
};

// Get messages for a specific chat
export const getChatMessages = async (chatId) => {
  try {
    const response = await axiosInstance.get(`/api/chat/${chatId}/messages`);
    return response.data;
  } catch (error) {
    console.log("error in getChatMessages api", error);
    throw error;
  }
};

// Send a message (creates chat if needed)
export const sendMessage = async (receiverId, textMessage, messageType = "text", imageUrl, videoUrl, fileUrl) => {
  try {
    const response = await axiosInstance.post("/api/chat/create", {
      receiverId,
      textMessage,
      messageType,
      imageUrl,
      videoUrl,
      fileUrl,
    });
    return response.data;
  } catch (error) {
    console.log("error in sendMessage api", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await axiosInstance.delete("/api/chat/delete-message", {
      data: { messageId },
    });
    return response.data;
  } catch (error) {
    console.log("error in deleteMessage api", error);
    throw error;
  }
};


export const updateProfile = async (formData) => {
  try {
    const response = await axiosInstance.patch("/api/auth/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.log("error in updateProfile api", error);
    throw error;
  }
};

// Send a media message (image/video/file) via multipart form
export const sendMediaMessage = async (formData) => {
  try {
    const response = await axiosInstance.post("/api/chat/send-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.log("error in sendMediaMessage api", error);
    throw error;
  }
};

// Upload a new status (image/video)
export const uploadStatus = async (formData) => {
  try {
    const response = await axiosInstance.post("/api/status/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    console.log("error in uploadStatus api", err);
    throw err;
  }
};

// Mark a status as watched
export const watchStatus = async (statusId) => {
  try {
    const response = await axiosInstance.post(`/api/status/watch/${statusId}`);
    return response.data;
  } catch (err) {
    console.log("error in watchStatus api", err);
    throw err;
  }
};

// Get my own statuses
export const getMyStatus = async () => {
  try {
    const response = await axiosInstance.get("/api/status/my-status");
    return response.data;
  } catch (err) {
    console.log("error in getMyStatus api", err);
    throw err;
  }
};

// Get statuses of contacts
export const getContactsStatuses = async () => {
  try {
    const response = await axiosInstance.get("/api/status/contacts");
    return response.data;
  } catch (err) {
    console.log("error in getContactsStatuses api", err);
    throw err;
  }
};
