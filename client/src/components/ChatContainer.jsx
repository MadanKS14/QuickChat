import { useEffect, useMemo, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useChat } from "../context/chatContext";
import { useAuth } from "../context/authContext";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage } = useChat();
  const { authUser, onlineUsers } = useAuth();

  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);

  const myId = authUser?._id?.toString();

  const isOnline = useMemo(() => {
    return selectedUser
      ? onlineUsers?.includes(selectedUser._id)
      : false;
  }, [onlineUsers, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, selectedUser?._id]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImage(file);
    setImageUrl(URL.createObjectURL(file));
  };

  const resetMessageState = () => {
    setNewMessage("");
    setImage(null);

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (sending) return;

    if (!newMessage.trim() && !image) return;

    setSending(true);

    try {
      const payload = {
        text: newMessage.trim(),
      };

      if (image) {
        const reader = new FileReader();

        reader.readAsDataURL(image);

        reader.onloadend = async () => {
          await sendMessage({
            ...payload,
            image: reader.result,
          });

          resetMessageState();
          setSending(false);
        };

        return;
      }

      await sendMessage(payload);

      resetMessageState();
    } finally {
      setSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center gap-3 text-white/50">
        <img
          src={assets.logo_icon}
          alt="QuickChat"
          className="w-16 h-16 opacity-50"
        />

        <p className="text-lg font-medium">
          Select a user to start chatting
        </p>
      </div>
    );
  }

  const renderMessage = (message) => {
    const senderId =
      typeof message.senderId === "object"
        ? message.senderId?._id?.toString()
        : String(message.senderId);

    const isMine = senderId === myId;

    return (
      <div
        key={message._id}
        className={`flex ${isMine ? "justify-end" : "justify-start"
          }`}
      >
        <div
          className={`max-w-[75%] flex flex-col ${isMine ? "items-end" : "items-start"
            }`}
        >
          {!isMine && (
            <img
              src={selectedUser.profilePic || assets.avatar_icon}
              alt={selectedUser.fullName}
              className="w-8 h-8 rounded-full object-cover mb-1"
            />
          )}

          <div
            className={`rounded-2xl p-3 shadow ${isMine
              ? "bg-violet-600 text-white rounded-br-sm"
              : "bg-white/10 text-white rounded-bl-sm"
              }`}
          >
            {message.image && (
              <img
                src={message.image}
                alt="Shared media"
                className="rounded-lg mb-2 max-w-[250px]"
              />
            )}

            {message.text && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.text}
              </p>
            )}
          </div>

          <span className="mt-1 text-[11px] text-white/90">
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

  return (
    <div className="flex flex-col h-full min-h-0 bg-black/10 backdrop-blur-lg">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/40">
        <img
          src={assets.arrow_icon}
          alt="Back"
          onClick={() => setSelectedUser(null)}
          className="w-6 cursor-pointer md:hidden"
        />

        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt={selectedUser.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1">
          <p className="font-semibold text-white">
            {selectedUser.fullName}
          </p>

          <p
            className={`text-xs ${isOnline
              ? "text-green-400"
              : "text-white/50"
              }`}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4"
      >
        {messages.length > 0 ? (
          messages.map(renderMessage)
        ) : (
          <p className="text-center text-white/50">
            No messages yet. Say hi 👋
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-white/10 bg-black/40 p-3"
      >
        {imageUrl && (
          <div className="relative mb-3 w-28 h-28">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />

            <button
              type="button"
              onClick={resetMessageState}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/70 text-white"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <input
              type="text"
              value={newMessage}
              placeholder="Type a message..."
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-sm"
            />

            <input
              type="file"
              id="image-upload"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            <label
              htmlFor="image-upload"
              className="cursor-pointer"
            >
              <img
                src={assets.gallery_icon}
                alt="Attach"
                className="w-5 opacity-60 hover:opacity-100"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="h-11 w-11 rounded-full bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition disabled:opacity-50"
          >
            <img
              src={assets.send_button}
              alt="Send"
              className="w-5"
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatContainer;