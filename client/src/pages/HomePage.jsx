import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { messagesDummyData } from '../assets/assets';

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState(messagesDummyData);

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`grid h-full rounded-2xl overflow-hidden border-2 border-gray-600 ${
          selectedUser
            ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
            : 'md:grid-cols-2'
        }`}
      >
        {/* Left Sidebar */}
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />

        {/* Chat Container */}
        <ChatContainer
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          messages={messages}
          setMessages={setMessages}
        />

        {/* Right Sidebar */}
        {selectedUser && (
          <RightSidebar selectedUser={selectedUser} messages={messages} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
