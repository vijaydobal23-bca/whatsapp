import {useContext} from "react";
import ChatContext from "./chat.context.jsx";


const chatContext = useContext(ChatContext);

export const ChatProvider = ({children})=>{
 
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

    return (
        <ChatContext.Provider value={{chats, selectedChat, messages, loadingChats, loadingMessages, error,setChats,setSelectedChat,setMessages,setLoadingChats,setLoadingMessages,setError}}>
            {children}
        </ChatContext.Provider>
    )
}