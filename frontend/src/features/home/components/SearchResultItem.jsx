import { useState } from "react";

const SearchResultItem = ({ userResult, onAddContact }) => {
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    try {
      setAdding(true);
      await onAddContact(userResult._id);
      setAdded(true);
    } catch (err) {
      console.log("error adding contact", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex items-center px-3 py-[10px] hover:bg-[#202c33] transition-colors">
      {/* Avatar */}
      <div className="w-[49px] h-[49px] rounded-full bg-[#6b7b8d] flex-shrink-0 flex items-center justify-center overflow-hidden mr-3">
        {userResult?.profilePicture ? (
          <img
            src={userResult.profilePicture}
            alt={userResult.username}
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

      {/* User info */}
      <div className="flex-1 min-w-0 border-b border-[#222d34] py-2">
        <span className="text-[#e9edef] text-[16px] font-normal truncate block">
          {userResult?.username || "Unknown"}
        </span>
        <span className="text-[#8696a0] text-[13px] truncate block">
          {userResult?.email || ""}
        </span>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={added || adding}
        className={`ml-3 px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
          added
            ? "bg-[#202c33] text-[#00a884] cursor-default"
            : adding
            ? "bg-[#202c33] text-[#8696a0] cursor-wait"
            : "bg-[#00a884] text-[#111b21] hover:bg-[#06cf9c]"
        }`}
      >
        {added ? "✓ Added" : adding ? "..." : "Add"}
      </button>
    </div>
  );
};

export default SearchResultItem;
