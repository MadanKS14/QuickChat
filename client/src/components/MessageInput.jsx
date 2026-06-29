import { useCallback, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../context/authContext";
import { useChat } from "../context/chatContext";

const TYPING_STOP_DELAY = 800;

const MessageInput = () => {
  const { selectedUser, sendMessage } = useChat();
  const { socket } = useAuth();

  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  return (
    <form
      onSubmit={handleSendMessage}
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
            onClick={resetMessageState}
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
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            aria-label="Toggle emoji picker"
            aria-expanded={showEmojiPicker}
            className="text-xl hover:scale-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
          >
            😊
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
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
            onChange={handleMessageChange}
            aria-label="Message"
            className="flex-1 min-w-0 bg-transparent outline-none text-white placeholder-white/40 text-sm"
          />

          <input
            type="file"
            id="image-upload"
            accept="image/*"
            hidden
            onChange={handleImageChange}
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
};

export default MessageInput;