const SearchBar = ({ searchQuery, onSearchChange, showSearch }) => {
  return (
    <div className="px-3 py-1.5">
      <div className="flex items-center bg-[#202c33] rounded-lg px-3 py-1">
        {/* Search icon */}
        <div className="flex items-center justify-center w-8 h-8">
          {searchQuery.length > 0 ? (
            <button onClick={() => onSearchChange("")}>
              <svg
                viewBox="0 0 24 24"
                className="w-[18px] h-[18px] fill-[#00a884] transition-transform rotate-0"
              >
                <path d="M12 4l1.41 1.41L7.83 11H20v2H7.83l5.58 5.59L12 20l-8-8 8-8z" />
              </svg>
            </button>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="w-[18px] h-[18px] fill-[#8696a0]"
            >
              <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-4.808 0a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z" />
            </svg>
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search or start a new chat"
          className="flex-1 bg-transparent text-[#d1d7db] placeholder-[#8696a0] text-[14px] py-1.5 px-2 outline-none"
        />
      </div>
    </div>
  );
};

export default SearchBar;
