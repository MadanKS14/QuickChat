import { useMemo } from "react";
import assets from "../assets/assets";
import { useChat } from "../context/chatContext";
import { useAuth } from "../context/authContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatContainer = () => {
  const { selectedUser, setSelectedUser, messages, typingUsers } = useChat();
  const { authUser, onlineUsers } = useAuth();

  const myId = authUser?._id?.toString();
  const isTyping = !!typingUsers?.[selectedUser?._id];

  const isOnline = useMemo(
    () => (selectedUser ? !!onlineUsers?.includes(selectedUser._id) : false),
    [onlineUsers, selectedUser]
  );

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center gap-3 h-full text-white/50">
        <img
          src={assets.logo_icon}
          alt="QuickChat logo"
          className="w-14 h-14 sm:w-16 sm:h-16 opacity-50"
        />
        <p className="text-base sm:text-lg font-medium">
          Select a user to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-black/10 backdrop-blur-lg">
      <ChatHeader
        selectedUser={selectedUser}
        isOnline={isOnline}
        isTyping={isTyping}
        onBack={() => setSelectedUser(null)}
      />

      <MessageList messages={messages} selectedUser={selectedUser} myId={myId} />

      <MessageInput />
    </div>
  );
};

const ChatHeader = ({ selectedUser, isOnline, isTyping, onBack }) => {
  const statusLabel = isTyping ? "Typing..." : isOnline ? "Online" : "Offline";
  const statusColor = isTyping
    ? "text-violet-400"
    : isOnline
    ? "text-green-400"
    : "text-white/50";

  return (
    <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-white/10 bg-black/40">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to chat list"
        className="md:hidden p-1 -ml-1"
      >
        <img src={assets.arrow_icon} alt="" className="w-6" />
      </button>

      <img
        src={selectedUser.profilePic || assets.avatar_icon}
        alt={selectedUser.fullName}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">
          {selectedUser.fullName}
        </p>
        <p className={`text-xs transition-all ${statusColor}`}>{statusLabel}</p>
      </div>
    </div>
  );
};

export default ChatContainer;