import React, { useEffect, useMemo, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useChat } from "../../context/chatContext";
import { useAuth } from "../../context/authContext";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage } = useChat();
  const { authUser, onlineUsers } = useAuth();

  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);

  const myId = authUser?._id?.toString?.();

  const isOnline = useMemo(() => {
    return selectedUser ? onlineUsers?.includes(selectedUser._id) : false;
  }, [onlineUsers, selectedUser]);

  // Auto-scroll to bottom on new messages or when switching threads
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser?._id]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !image) return;

    const base = { text: newMessage };

    const actuallySend = (payload) => {
      sendMessage(payload);
      setNewMessage("");
      setImage(null);
      setImageUrl("");
    };

    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = () => {
        actuallySend({ ...base, image: reader.result });
      };
    } else {
      actuallySend(base);
    }
  };

  if (!selectedUser) {
    // Shown when no chat is selected
    return (
      <div className="hidden md:flex flex-col items-center justify-center gap-2 text-white/50 bg-transparent h-full">
        <img src={assets.logo_icon} alt="Logo" className="w-16 h-16 opacity-50" />
        <p className="text-lg font-medium">Select a user to start chatting</p>
      </div>
    );
  }

  const renderMessage = (msg) => {
    // Safely normalize sender id for comparison
    const senderIdStr =
      (typeof msg?.senderId === "object" && msg?.senderId?._id)
        ? msg.senderId._id.toString()
        : msg?.senderId?.toString?.();

    const isMine = senderIdStr && myId && senderIdStr === myId;

    return (
      <div
        key={msg._id}
        className={`flex items-start gap-2.5 ${isMine ? "justify-end" : "justify-start"}`}
      >
        {!isMine && (
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        )}

        <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[75%]`}>
          <div
            className={`p-3 rounded-2xl shadow ${
              isMine
                ? "bg-purple-600 text-white rounded-br-sm"
                : "bg-white/10 text-white rounded-bl-sm"
            }`}
          >
            {msg.image && (
              <img
                src={msg.image}
                alt="media"
                className="rounded-lg mb-2 max-w-full h-auto"
              />
            )}
            {msg.text && (
              <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
            )}
          </div>
          <span className="mt-1 text-[10px] opacity-70">
            {formatMessageTime(msg.createdAt)}
            {isMine && <span className="ml-1">{msg.seen ? "✓✓" : "✓"}</span>}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-black/10 backdrop-blur-lg">
      {/* Header (sticky) */}
      <div className="sticky top-0 z-10 flex items-center gap-3 py-3 px-4 border-b border-white/10 bg-black/40 backdrop-blur-lg">
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-6 cursor-pointer"
        />
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt={selectedUser.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-lg text-white font-semibold">{selectedUser.fullName}</p>
          <p className={`text-xs ${isOnline ? "text-green-400" : "text-white/60"}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
        <img src={assets.help_icon} alt="Info" className="w-6 h-6 opacity-70" />
      </div>

      {/* Messages (only this scrolls) */}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4"
      >
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map(renderMessage)
        ) : (
          <p className="text-center text-white/50">No messages yet. Say hi 👋</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input (sticky) */}
      <form
        onSubmit={handleSendMessage}
        className="sticky bottom-0 z-10 flex flex-col gap-2 p-3 border-t border-white/10 bg-black/40 backdrop-blur-lg"
      >
        {imageUrl && (
          <div className="relative w-24 h-24">
            <img
              src={imageUrl}
              alt="preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setImage(null);
                setImageUrl("");
              }}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/70 text-white text-xs"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <input
              type="text"
              placeholder="Send a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/40"
            />
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            <label htmlFor="image" className="cursor-pointer">
              <img
                src={assets.gallery_icon}
                alt="Attach"
                className="w-5 opacity-50 hover:opacity-100"
              />
            </label>
          </div>

          <button
            type="submit"
            className="p-0 bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center hover:bg-purple-700 transition-colors"
          >
            <img src={assets.send_button} alt="Send" className="w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatContainer;
