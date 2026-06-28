import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useChat } from "../context/chatContext";
import { useAuth } from "../context/authContext";
import EmojiPicker from "emoji-picker-react";

const TYPING_STOP_DELAY = 800;

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, typingUsers, editMessage, deleteMessage } =
    useChat();
  const { authUser, onlineUsers, socket } = useAuth();

  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedText, setEditedText] = useState("");



  const bottomRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const myId = authUser?._id?.toString();
  const isTyping = !!typingUsers?.[selectedUser?._id];

  const isOnline = useMemo(
    () => (selectedUser ? !!onlineUsers?.includes(selectedUser._id) : false),
    [onlineUsers, selectedUser]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser?._id]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  const resetMessageState = useCallback(() => {
    setNewMessage("");
    setImage(null);

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl("");
  }, [imageUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageUrl) URL.revokeObjectURL(imageUrl);

    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const emitTyping = useCallback(() => {
    if (!socket || !selectedUser) return;

    socket.emit("typing", { receiverId: selectedUser._id });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, TYPING_STOP_DELAY);
  }, [socket, selectedUser]);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    emitTyping();
  };


  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (sending) return;
    if (!newMessage.trim() && !image) return;

    setSending(true);

    try {
      const payload = { text: newMessage.trim() };

      if (image) {
        const reader = new FileReader();
        reader.readAsDataURL(image);

        reader.onloadend = async () => {
          await sendMessage({ ...payload, image: reader.result });

          socket?.emit("stopTyping", { receiverId: selectedUser._id });

          resetMessageState();
          setSending(false);
          setShowEmojiPicker(false);
        };

        return;
      }

      await sendMessage(payload);

      socket?.emit("stopTyping", { receiverId: selectedUser._id });

      resetMessageState();
    } finally {
      setSending(false);
    }
  };

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

      <MessageList
        messages={messages}
        selectedUser={selectedUser}
        myId={myId}

        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}

        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}

        editedText={editedText}
        setEditedText={setEditedText}
      />

      <MessageComposer
        newMessage={newMessage}
        onMessageChange={handleMessageChange}
        onSubmit={handleSendMessage}
        imageUrl={imageUrl}
        onImageChange={handleImageChange}
        onClearImage={resetMessageState}
        sending={sending}
        showEmojiPicker={showEmojiPicker}
        onToggleEmojiPicker={() => setShowEmojiPicker((prev) => !prev)}
        onEmojiClick={handleEmojiClick}
        emojiPickerRef={emojiPickerRef}
      />
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

const MessageList = ({
  messages,
  selectedUser,
  myId,

  activeMenu,
  setActiveMenu,

  editingMessage,
  setEditingMessage,

  editedText,
  setEditedText,

  editMessage,
  deleteMessage,
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
      {messages.length > 0 ? (
        messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            myId={myId}
            selectedUser={selectedUser}

            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}

            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}

            editedText={editedText}
            setEditedText={setEditedText}
          />
        ))
      ) : (
        <p className="text-center text-white/50">No messages yet. Say hi 👋</p>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

const MessageBubble = ({ message, myId, selectedUser }) => {
  const { editMessage, deleteMessage } = useChat();

  const senderId =
    typeof message.senderId === "object"
      ? message.senderId?._id?.toString()
      : String(message.senderId);

  const isMine = senderId === myId;

  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text || "");

  const handleSave = async () => {
    if (!editedText.trim()) return;

    await editMessage(message._id, editedText);

    setIsEditing(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Delete this message?"
    );

    if (!confirmDelete) return;

    await deleteMessage(message._id);

    setShowMenu(false);
  };

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"
        }`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"
          }`}
      >
        {!isMine && (
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt={selectedUser.fullName}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover mb-1"
          />
        )}

        <div
          className={`relative rounded-2xl p-3 shadow ${isMine
              ? "bg-violet-600 text-white rounded-br-sm"
              : "bg-white/10 text-white rounded-bl-sm"
            }`}
        >
          {/* Three Dot Menu */}
          {isMine && !message.deleted && (
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-white/60 hover:text-white text-lg"
              >
                ⋮
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-32 rounded-lg bg-[#282142] border border-white/10 shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10"
                  >
                    ✏ Edit
                  </button>

                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Image */}
          {!message.deleted && message.image && (
            <img
              src={message.image}
              alt="Shared attachment"
              className="rounded-lg mb-2 max-w-[200px] sm:max-w-[250px] w-full"
            />
          )}

          {/* Deleted */}
          {message.deleted ? (
            <p className="italic text-sm text-white/50">
              🚫 This message was deleted
            </p>
          ) : isEditing ? (
            <div className="flex flex-col gap-2 mt-2">
              <input
                value={editedText}
                onChange={(e) =>
                  setEditedText(e.target.value)
                }
                className="bg-white/10 rounded px-2 py-1 outline-none text-sm"
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-3 py-1 rounded bg-gray-600"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="text-xs px-3 py-1 rounded bg-green-600"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.text && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </p>
              )}

              {message.edited && (
                <p className="text-[10px] italic text-white/60 mt-1">
                  Edited
                </p>
              )}
            </>
          )}
        </div>

        <span className="mt-1 text-[11px] text-white/70">
          {formatMessageTime(message.createdAt)}

          {isMine && (
            <span className="ml-1 text-white font-semibold">
              {message.seen ? "✓✓" : "✓"}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

const MessageComposer = ({
  newMessage,
  onMessageChange,
  onSubmit,
  imageUrl,
  onImageChange,
  onClearImage,
  sending,
  showEmojiPicker,
  onToggleEmojiPicker,
  onEmojiClick,
  emojiPickerRef,
}) => (
  <form
    onSubmit={onSubmit}
    className="border-t border-white/10 bg-black/40 p-2 sm:p-3"
  >
    {imageUrl && (
      <div className="relative mb-3 w-24 h-24 sm:w-28 sm:h-28">
        <img
          src={imageUrl}
          alt="Selected attachment preview"
          className="w-full h-full object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={onClearImage}
          aria-label="Remove attached image"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition"
        >
          ×
        </button>
      </div>
    )}

    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative" ref={emojiPickerRef}>
        <button
          type="button"
          onClick={onToggleEmojiPicker}
          aria-label="Toggle emoji picker"
          aria-expanded={showEmojiPicker}
          className="text-xl hover:scale-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
        >
          😊
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-50">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme="dark"
              searchDisabled={false}
              skinTonesDisabled={false}
              lazyLoadEmojis
            />
          </div>
        )}
      </div>

      <div className="flex items-center flex-1 bg-white/5 border border-white/10 rounded-full px-3 sm:px-4 py-2 min-w-0">
        <input
          type="text"
          value={newMessage}
          placeholder="Type a message..."
          onChange={onMessageChange}
          aria-label="Message"
          className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder-white/40 text-sm"
        />

        <input
          type="file"
          id="image-upload"
          accept="image/*"
          hidden
          onChange={onImageChange}
        />

        <label htmlFor="image-upload" className="cursor-pointer ml-2 flex-shrink-0">
          <img
            src={assets.gallery_icon}
            alt="Attach image"
            className="w-5 opacity-60 hover:opacity-100 transition"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={sending}
        aria-label="Send message"
        className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <img src={assets.send_button} alt="" className="w-5" />
      </button>
    </div>
  </form>
);

export default ChatContainer;