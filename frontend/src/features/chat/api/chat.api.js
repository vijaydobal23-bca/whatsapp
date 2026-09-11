import axios from "axios";

const axiosInstance = axios.create({
    baseURL:"http://localhost:3000",
    withCredentials:true
});



export const getMyContacts = async()=>{
    try{
        const response = await axiosInstance.get("/api/contact/my-contacts");
        return response.data;
    }catch(error){
        console.log("error in getMyContacts api", error);
        throw error;
    }
}



export const addNewContact = async(contactUser)=>{
  try {
    const response = await axiosInstance.post("/api/contact/add",{contactUser});
    return response.data;
  } catch (error) {
    console.log("error in addNewContact api", error);
    throw error;
  }
}

export const createChat = async(receiverId, textMessage, messageType, imageUrl, videoUrl, fileUrl) => {
  try {
    const response = await axiosInstance.post("/api/chat/create",{receiverId, textMessage, messageType, imageUrl, videoUrl, fileUrl});
    return response.data;
  } catch (error) {
    console.log("error in createChat api", error);
    throw error;
  }
}