import { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";
import SearchBar from "./SearchBar";
import ContactListItem from "./ContactListItem";
import SearchResultItem from "./SearchResultItem";
import StatusSidebar from "./StatusSidebar";

const Sidebar = ({
  user,
  chats,
  contacts,
  loading,
  selectedChat,
  searchQuery,
  setSearchQuery,
  searchResults,
  fetchAllChats,
  fetchAllContacts,
  addContact,
  searchForUsers,
  selectChat,
  getOtherParticipant,
  sidebarTab,
  setSidebarTab,
  onOpenProfile,
  onlineUsers,
  socketConnected,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    fetchAllChats();
    fetchAllContacts();
  }, [fetchAllChats, fetchAllContacts]);

  // Handle search input
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim().length > 0) {
      searchForUsers(value);
    }
  };

  return (
    <div className="relative overflow-hidden w-[420px] min-w-[320px] h-full flex flex-col bg-[#111b21] border-r border-[#222d34]">
      {/* Header */}
      <div className="h-[60px] px-4 flex items-center justify-between bg-[#202c33]">
        {/* User avatar */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full bg-[#6b7b8d] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            title="Profile"
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg viewBox="0 0 212 212" className="w-full h-full">
                <path
                  fill="#DFE5E7"
                  d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z"
                />
                <path
                  fill="#FFF"
                  d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c0 .009-.005.015-.005.024a106.66 106.66 0 0 0 36.588 32.985 106.397 106.397 0 0 0 21.218 8.956c.025.005.045.015.07.02a106.201 106.201 0 0 0 50.615 0c.015-.005.04-.015.065-.02a106.36 106.36 0 0 0 21.218-8.956 106.643 106.643 0 0 0 36.588-32.985c-.005-.009-.005-.015-.01-.024a55.39 55.39 0 0 0-1.442-2.324z"
                />
                <path
                  fill="#FFF"
                  d="M106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z"
                />
              </svg>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                socketConnected ? "bg-[#00a884]" : "bg-[#8696a0]"
              }`}
            />
            <span className="text-[#8696a0] text-[12px]">
              {socketConnected ? "online" : "offline"}
            </span>
          </div>
        </div>

        {/* Header icons */}
        <div className="flex items-center gap-2">
          {/* Status */}
          <button
            onClick={() => setShowStatus(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors"
            title="Status"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] fill-[#aebac1]"
            >
              <path d="M12 20.664a9.163 9.163 0 0 1-6.521-2.702.977.977 0 0 1 1.381-1.381 7.269 7.269 0 0 0 10.024.244.977.977 0 0 1 1.313 1.445A9.192 9.192 0 0 1 12 20.664zm7.965-6.112a.977.977 0 0 1-.944-1.229 7.26 7.26 0 0 0-4.8-8.804.977.977 0 0 1 .594-1.86 9.212 9.212 0 0 1 6.092 11.169.976.976 0 0 1-.942.724zm-16.025-.39a.977.977 0 0 1-.953-.769 9.21 9.21 0 0 1 6.626-10.86.977.977 0 1 1 .444 1.897 7.259 7.259 0 0 0-5.141 8.53.977.977 0 0 1-.976 1.202z" />
            </svg>
          </button>

          {/* New chat / search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors"
            title="New chat"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] fill-[#aebac1]"
            >
              <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z" />
            </svg>
          </button>

          {/* Menu */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#374045] transition-colors">
            <svg
              viewBox="0 0 24 24"
              className="w-[22px] h-[22px] fill-[#aebac1]"
            >
              <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        showSearch={showSearch}
      />

      {/* Tabs - All, Unread, Favourites, Groups */}
      <div className="flex items-center gap-1.5 px-3 py-2">
        {["chats", "contacts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSidebarTab(tab)}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium capitalize transition-all duration-200 ${
              sidebarTab === tab
                ? "bg-[#00a884] text-[#111b21]"
                : "bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chat / Contact / Search list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Search Results */}
        {searchQuery.trim().length > 0 ? (
          <div>
            <div className="px-8 py-3">
              <span className="text-[#00a884] text-[13px] font-medium uppercase tracking-wide">
                Search Results
              </span>
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((u) => (
                <SearchResultItem
                  key={u._id}
                  userResult={u}
                  onAddContact={addContact}
                />
              ))
            ) : (
              <div className="px-8 py-4 text-[#8696a0] text-sm">
                No results found
              </div>
            )}
          </div>
        ) : sidebarTab === "chats" ? (
          /* Chat List */
          loading && chats.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const isOnline = onlineUsers?.includes(otherUser?._id);

              return (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  isSelected={selectedChat?._id === chat._id}
                  onSelect={() => selectChat(chat)}
                  otherUser={otherUser}
                  currentUser={user}
                  isOnline={isOnline}
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#8696a0]">
                  <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z" />
                </svg>
              </div>
              <p className="text-[#8696a0] text-sm text-center">
                No chats yet. Start a conversation!
              </p>
            </div>
          )
        ) : /* Contact List */
        loading && contacts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : contacts.length > 0 ? (
          contacts.map((contact) => {
            const isOnline = onlineUsers?.includes(
              contact.contactUser?._id || contact._id,
            );
            return (
              <ContactListItem
                key={contact._id}
                contact={contact}
                onSelect={selectChat}
                currentUser={user}
                isOnline={isOnline}
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#8696a0]">
                <path d="M15.5 12c2.5 0 7.5 1.25 7.5 3.75V18H8v-2.25C8 13.25 13 12 15.5 12zM5 9.5a3 3 0 100-6 3 3 0 000 6zm10.5 0a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM5 11c-2.33 0-7 1.17-7 3.5V17h7v-2.25c0-.85.33-2.34 2.37-3.47C6.5 11.1 5.67 11 5 11z" />
              </svg>
            </div>
            <p className="text-[#8696a0] text-sm text-center">
              No contacts yet. Search and add contacts!
            </p>
          </div>
        )}
      </div>

      {/* Status Overlay */}
      {showStatus && (
        <StatusSidebar
          onClose={() => setShowStatus(false)}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default Sidebar;
