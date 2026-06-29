import { useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useChat } from "../context/chatContext";

const MessageList = ({ messages, selectedUser, myId }) => {
  const bottomRef = useRef(null);

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startEditing = (message) => {
    setEditingMessageId(message._id);
    setEditedText(message.text || "");
    setActiveMenuId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditedText("");
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
      {messages.length > 0 ? (
        messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            myId={myId}
            selectedUser={selectedUser}
            isMenuOpen={activeMenuId === message._id}
            onToggleMenu={() =>
              setActiveMenuId((current) =>
                current === message._id ? null : message._id
              )
            }
            onCloseMenu={() => setActiveMenuId(null)}
            isEditing={editingMessageId === message._id}
            editedText={editedText}
            onEditedTextChange={setEditedText}
            onStartEditing={() => startEditing(message)}
            onCancelEditing={cancelEditing}
          />
        ))
      ) : (
        <p className="text-center text-white/50">No messages yet. Say hi 👋</p>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

const MessageBubble = ({
  message,
  myId,
  selectedUser,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  isEditing,
  editedText,
  onEditedTextChange,
  onStartEditing,
  onCancelEditing,
}) => {
  const { editMessage, deleteMessage } = useChat();

  const senderId =
    typeof message.senderId === "object"
      ? message.senderId?._id?.toString()
      : String(message.senderId);

  const isMine = senderId === myId;

  const handleSave = async () => {
    if (!editedText.trim()) return;

    await editMessage(message._id, editedText);
    onCancelEditing();
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this message?");
    if (!confirmDelete) return;

    await deleteMessage(message._id);
    onCloseMenu();
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] sm:max-w-[75%] flex flex-col ${
          isMine ? "items-end" : "items-start"
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
          className={`relative rounded-2xl p-3 shadow ${
            isMine
              ? "bg-violet-600 text-white rounded-br-sm"
              : "bg-white/10 text-white rounded-bl-sm"
          }`}
        >
          {isMine && !message.deleted && (
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={onToggleMenu}
                aria-label="Message options"
                aria-expanded={isMenuOpen}
                className="text-white/60 hover:text-white text-lg leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded"
              >
                ⋮
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-lg bg-[#282142] border border-white/10 shadow-lg overflow-hidden z-50">
                  <button
                    type="button"
                    onClick={onStartEditing}
                    className="w-full text-left px-4 py-2 hover:bg-white/10"
                  >
                    ✏ Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10"
                  >
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {!message.deleted && message.image && (
            <img
              src={message.image}
              alt="Shared attachment"
              className="rounded-lg mb-2 max-w-[200px] sm:max-w-[250px] w-full"
            />
          )}

          {message.deleted ? (
            <p className="italic text-sm text-white/50">
              🚫 This message was deleted
            </p>
          ) : isEditing ? (
            <div className="flex flex-col gap-2 mt-2">
              <input
                value={editedText}
                onChange={(e) => onEditedTextChange(e.target.value)}
                aria-label="Edit message"
                className="bg-white/10 rounded px-2 py-1 outline-none text-sm focus:ring-2 focus:ring-violet-400"
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={onCancelEditing}
                  className="text-xs px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="text-xs px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition"
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
                <p className="text-[10px] italic text-white/60 mt-1">Edited</p>
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

export default MessageList;