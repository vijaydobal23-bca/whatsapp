import { createContext, useState } from "react";

const HomeContext = createContext(null);

export function HomeContextProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  return (
    <HomeContext.Provider
      value={{
        loading,
        setLoading,
        contacts,
        setContacts,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        messages,
        setMessages,
        searchQuery,
        setSearchQuery,
        searchResults,
        setSearchResults,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export default HomeContext;
