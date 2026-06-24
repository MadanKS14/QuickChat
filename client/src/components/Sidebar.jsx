import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../context/authContext";
import { useChat } from "../context/chatContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { authUser, logout, onlineUsers } = useAuth();

  const {
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    getMessages,
  } = useChat();

  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    return users.filter((user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    await getMessages(user._id);
  };

  return (
    <aside className="bg-black/20 backdrop-blur-lg h-full p-4 text-white flex flex-col border-r border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <img
            src={assets.logo_icon}
            alt="QuickChat"
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold">QuickChat</h1>
        </div>

        <div className="relative" ref={menuRef}>
          <img
            src={authUser?.profilePic || assets.avatar_icon}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover cursor-pointer border border-white/10"
            onClick={() => setShowMenu((prev) => !prev)}
          />

          {showMenu && (
            <div className="absolute right-0 top-12 w-44 rounded-lg bg-[#282142] border border-white/10 shadow-lg z-50 overflow-hidden">
              <button
                onClick={() => {
                  navigate("/profile");
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition"
              >
                Edit Profile
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-full bg-white/5 border border-white/10">
        <img
          src={assets.search_icon}
          alt="Search"
          className="w-4 h-4 opacity-50"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="flex-1 bg-transparent outline-none text-sm placeholder-white/40"
        />
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {filteredUsers.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-white/50">
              No users found
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers?.includes(user._id);
            const unseenCount = unseenMessages?.[user._id] || 0;
            const isSelected = selectedUser?._id === user._id;

            return (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-white/15 border border-white/20"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt={user.fullName}
                    className="w-11 h-11 rounded-full object-cover"
                  />

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user.fullName}
                  </p>

                  <p
                    className={`text-xs ${
                      isOnline
                        ? "text-green-400"
                        : "text-white/50"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>

                {unseenCount > 0 && (
                  <div className="min-w-5 h-5 px-1 bg-violet-600 rounded-full flex items-center justify-center text-[11px] font-semibold">
                    {unseenCount > 99 ? "99+" : unseenCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;