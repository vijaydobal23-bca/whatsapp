import { useState } from "react";
import { useHome } from "../hooks/useHome";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import EmptyChatArea from "../components/EmptyChatArea";
import ProfilePanel from "../components/ProfilePanel";

const HomePage = () => {
  const {
    user,
    chats,
    contacts,
    loading,
    selectedChat,
    messages,
    searchQuery,
    setSearchQuery,
    searchResults,
    fetchAllChats,
    fetchAllContacts,
    addContact,
    searchForUsers,
    handleSendMessage,
    handleFileUpload,
    selectChat,
    setSelectedChat,
    getOtherParticipant,
    fetchMessages,
    handleUpdateProfile,
    onlineUsers,
    socketConnected,
  } = useHome();

  const [sidebarTab, setSidebarTab] = useState("chats");
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="h-screen w-screen flex bg-[#0b141a] overflow-hidden relative">
      {/* Profile Panel overlay */}
      {showProfile && (
        <ProfilePanel
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={handleUpdateProfile}
          loading={loading}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        user={user}
        chats={chats}
        contacts={contacts}
        loading={loading}
        selectedChat={selectedChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        fetchAllChats={fetchAllChats}
        fetchAllContacts={fetchAllContacts}
        addContact={addContact}
        searchForUsers={searchForUsers}
        selectChat={selectChat}
        getOtherParticipant={getOtherParticipant}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        onOpenProfile={() => setShowProfile(true)}
        onlineUsers={onlineUsers}
        socketConnected={socketConnected}
      />

      {/* Chat Area */}
      {selectedChat ? (
        <ChatArea
          user={user}
          selectedChat={selectedChat}
          messages={messages}
          setSelectedChat={setSelectedChat}
          getOtherParticipant={getOtherParticipant}
          handleSendMessage={handleSendMessage}
          handleFileUpload={handleFileUpload}
          fetchMessages={fetchMessages}
          onlineUsers={onlineUsers}
        />
      ) : (
        <EmptyChatArea />
      )}
    </div>
  );
};

export default HomePage;
