import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import assets from "../assets/assets";
import { useAuth } from "../context/authContext";
import { useChat } from "../context/chatContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { authUser, logout, onlineUsers } = useAuth();

  const {
    conversations,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    getMessages,
  } = useChat();

  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = ({ target }) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter(({ participant }) =>
      participant.fullName.toLowerCase().includes(query)
    );
  }, [conversations, search]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    await getMessages(user._id);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-black/20 backdrop-blur-lg text-white">

      {/* Header */}

      <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">

        <div className="flex items-center gap-3">
          <img
            src={assets.logo_icon}
            alt="QuickChat"
            className="h-8 w-8"
          />

          <h1 className="hidden sm:block text-xl font-bold">
            QuickChat
          </h1>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="rounded-full outline-none"
          >
            <img
              src={authUser?.profilePic || assets.avatar_icon}
              alt="Profile"
              className="h-10 w-10 rounded-full border border-white/10 object-cover"
            />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#282142] shadow-xl">

              <button
                onClick={() => {
                  navigate("/profile");
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm transition hover:bg-white/10"
              >
                Edit Profile
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}

      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">

          <img
            src={assets.search_icon}
            alt="Search"
            className="h-4 w-4 opacity-50"
          />

          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Conversation List */}

      <div className="flex-1 overflow-y-auto px-2 pb-2">

        {filteredConversations.length === 0 ? (
          <div className="flex h-full items-center justify-center">

            <p className="text-sm text-white/50">
              No conversations found
            </p>

          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const user = conversation.participant;

            const isSelected =
              selectedUser?._id === user._id;

            const isOnline =
              onlineUsers?.includes(user._id);

            const unseenCount =
              unseenMessages?.[user._id] || 0;

            return (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200
                  ${
                    isSelected
                      ? "border-violet-500/40 bg-violet-500/20"
                      : "border-transparent hover:bg-white/5"
                  }`}
              >
                <div className="relative flex-shrink-0">

                  <img
                    src={user.profilePic || assets.avatar_icon}
                    alt={user.fullName}
                    className="h-11 w-11 rounded-full object-cover"
                  />

                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-green-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-2">

                    <p className="truncate font-semibold">
                      {user.fullName}
                    </p>

                    {conversation.lastMessage && (
                      <span className="text-[11px] text-white/50 flex-shrink-0">
                        {formatTime(conversation.updatedAt)}
                      </span>
                    )}
                  </div>

                  <p className="truncate text-xs text-white/50">
                    {conversation.lastMessage?.image
                      ? "📷 Photo"
                      : conversation.lastMessage?.text ||
                        "Start chatting"}
                  </p>
                </div>

                {unseenCount > 0 && (
                  <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] font-semibold text-white">

                    {unseenCount > 99
                      ? "99+"
                      : unseenCount}

                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;