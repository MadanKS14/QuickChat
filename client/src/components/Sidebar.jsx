import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import assets from "../assets/assets";
import { useAuth } from "../context/authContext";
import { useChat } from "../context/chatContext";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const Sidebar = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const { authUser, logout, onlineUsers } = useAuth();

  const {
    conversations,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    getMessages,
  } = useChat();

  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = ({ target }) => {
      if (menuRef.current && !menuRef.current.contains(target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const query = search.trim().toLowerCase();

  const filteredConversations = useMemo(() => {
    if (!query) return conversations;

    return conversations.filter(({ participant }) =>
      participant.fullName.toLowerCase().includes(query)
    );
  }, [conversations, query]);

  const remainingUsers = useMemo(() => {
    const conversationIds = new Set(
      conversations.map((c) => c.participant._id)
    );

    const withoutConversations = users.filter(
      (user) => !conversationIds.has(user._id)
    );

    if (!query) return withoutConversations;

    return withoutConversations.filter((user) =>
      user.fullName.toLowerCase().includes(query)
    );
  }, [users, conversations, query]);

  const hasNoResults =
    filteredConversations.length === 0 && remainingUsers.length === 0;

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    await getMessages(user._id);
  };

  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-black/20 backdrop-blur-lg text-white">
      <SidebarHeader
        authUser={authUser}
        showMenu={showMenu}
        onToggleMenu={() => setShowMenu((prev) => !prev)}
        onEditProfile={() => {
          navigate("/profile");
          setShowMenu(false);
        }}
        onLogout={() => {
          logout();
          setShowMenu(false);
        }}
        menuRef={menuRef}
      />

      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
          <img
            src={assets.search_icon}
            alt=""
            className="h-4 w-4 opacity-50"
          />

          <input
            type="text"
            placeholder="Search people..."
            aria-label="Search people"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {hasNoResults ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-white/50">No results found</p>
          </div>
        ) : (
          <>
            {filteredConversations.length > 0 && (
              <SidebarSection title="Recent Chats">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.participant._id}
                    conversation={conversation}
                    isSelected={
                      selectedUser?._id === conversation.participant._id
                    }
                    isOnline={onlineUsers?.includes(
                      conversation.participant._id
                    )}
                    unseenCount={
                      unseenMessages?.[conversation.participant._id] || 0
                    }
                    onSelect={() => handleSelectUser(conversation.participant)}
                  />
                ))}
              </SidebarSection>
            )}

            {remainingUsers.length > 0 && (
              <SidebarSection title="All Users">
                {remainingUsers.map((user) => (
                  <UserItem
                    key={user._id}
                    user={user}
                    isSelected={selectedUser?._id === user._id}
                    isOnline={onlineUsers?.includes(user._id)}
                    onSelect={() => handleSelectUser(user)}
                  />
                ))}
              </SidebarSection>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

const SidebarHeader = ({
  authUser,
  showMenu,
  onToggleMenu,
  onEditProfile,
  onLogout,
  menuRef,
}) => (
  <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
    <div className="flex items-center gap-3">
      <img src={assets.logo_icon} alt="QuickChat" className="h-8 w-8" />
      <h1 className="hidden sm:block text-xl font-bold">QuickChat</h1>
    </div>

    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label="Open profile menu"
        aria-expanded={showMenu}
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <img
          src={authUser?.profilePic || assets.avatar_icon}
          alt="Your profile"
          className="h-10 w-10 rounded-full border border-white/10 object-cover"
        />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#282142] shadow-xl">
          <button
            type="button"
            onClick={onEditProfile}
            className="w-full px-4 py-3 text-left text-sm transition hover:bg-white/10"
          >
            Edit Profile
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full px-4 py-3 text-left text-sm transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </div>
);

const SidebarSection = ({ title, children }) => (
  <div className="mb-2">
    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/40">
      {title}
    </p>
    {children}
  </div>
);

const PresenceAvatar = ({ user, isOnline }) => (
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
);

const listItemClasses = (isSelected) =>
  `mb-1 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
    isSelected
      ? "border-violet-500/40 bg-violet-500/20"
      : "border-transparent hover:bg-white/5"
  }`;

const ConversationItem = ({
  conversation,
  isSelected,
  isOnline,
  unseenCount,
  onSelect,
}) => {
  const user = conversation.participant;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={listItemClasses(isSelected)}
    >
      <PresenceAvatar user={user} isOnline={isOnline} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-semibold">{user.fullName}</p>

          {conversation.lastMessage && (
            <span className="text-[11px] text-white/50 flex-shrink-0">
              {formatTime(conversation.updatedAt)}
            </span>
          )}
        </div>

        <p className="truncate text-xs text-white/50">
          {conversation.lastMessage?.image
            ? "📷 Photo"
            : conversation.lastMessage?.text || "Start chatting"}
        </p>
      </div>

      {unseenCount > 0 && (
        <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[11px] font-semibold text-white">
          {unseenCount > 99 ? "99+" : unseenCount}
        </div>
      )}
    </button>
  );
};

const UserItem = ({ user, isSelected, isOnline, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={listItemClasses(isSelected)}
  >
    <PresenceAvatar user={user} isOnline={isOnline} />

    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold">{user.fullName}</p>
      <p className="truncate text-xs text-white/50">
        {isOnline ? "Online" : "Tap to start chatting"}
      </p>
    </div>
  </button>
);

export default Sidebar;