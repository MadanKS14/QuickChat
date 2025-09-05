import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { messagesDummyData } from '../assets/assets';

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState(messagesDummyData);

  return (
    <div className="w-full h-screen sm:px-[5%] sm:py-[3%] bg-black/5">
      <div
        className={`grid h-full rounded-2xl overflow-hidden border-2 border-gray-600 ${
          selectedUser
            ? 'md:grid-cols-[1fr_2fr_1fr] xl:grid-cols-[1fr_3fr_1fr]'
            : 'md:grid-cols-2'
        }`}
      >
        {/* Sidebar */}
        <Sidebar  />

        {/* Chat Container */}
        <ChatContainer/>

        {/* Right Sidebar */}
        {selectedUser && <RightSidebar selectedUser={selectedUser} messages={messages} />}
      </div>
    </div>
  );
};

export default HomePage;