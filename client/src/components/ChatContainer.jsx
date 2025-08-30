import React, { useEffect, useRef, useState } from 'react';
import assets, { messagesDummyData } from '../assets/assets';
import { formatMessageTime } from '../lib/utils';

const ChatContainer = ({ selectedUser, setSelectedUser, messages, setMessages }) => {
  const currentUserId = '680f50e4f10f3cd28382ecf9';
  const scrollEnd = useRef();
  const [newMessage, setNewMessage] = useState('');

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msgObj = {
      senderId: currentUserId,
      receiverId: selectedUser._id,
      text: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, msgObj]);
    setNewMessage('');
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} alt="Logo" className="max-w-16" />
        <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative bg-black/10">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-700 bg-black/40 z-10">
        <img
          src={selectedUser.profilePic || assets.profile_martin}
          alt={selectedUser.fullName}
          className="w-8 h-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          <span className="w-2 h-2 rounded-full bg-green-500" />
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="Help" className="hidden md:block w-5" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.senderId === currentUserId;
          return (
            <div
              key={idx}
              className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt="media"
                  className="max-w-[230px] rounded-lg border border-gray-700"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] text-white rounded-lg break-words ${
                    isCurrentUser ? 'bg-violet-500/30 rounded-br-none' : 'bg-gray-600/30 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}
              <span className="text-xs text-gray-400 mt-1">
                {msg.createdAt && formatMessageTime(msg.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={scrollEnd} />
      </div>

      {/* Bottom Input Bar */}
      <div className="flex items-center gap-3 p-3 border-t border-gray-700 bg-black/40">
        <div className="flex-1 flex items-center bg-gray-100/10 px-3 rounded-full">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-transparent outline-none text-white text-sm p-2 placeholder-gray-400"
          />
          <input type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="Attach" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img
          src={assets.send_button}
          alt="Send"
          className="w-7 cursor-pointer"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
