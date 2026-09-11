import { useContext } from "react";
import ChatContext from "../chat.context.jsx";

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatContextProvider");
  }


  function getother(chat){
    return chat.participants.find((p)=> p._id !== context.user._id) || chat.participants[0];
  }


  async function fetchChats(){
    try {
      
    
        
      const res = await getMyContacts();
    } catch (error) {
        
    }
      
  }


  return context;
};