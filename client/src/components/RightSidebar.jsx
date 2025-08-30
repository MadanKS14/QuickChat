import React from 'react';
import assets, { messagesDummyData } from '../assets/assets';

const RightSidebar = ({ selectedUser, messages }) => {
  if (!selectedUser) return null;

  const userMessages = messages.filter(msg => msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id);

  return (
    <div className="bg-[#8185B2]/10 h-full p-5 rounded-l-xl overflow-y-auto text-white">
      <div className="flex flex-col items-center">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt={selectedUser.fullName} className="w-16 aspect-[1/1] rounded-full" />
        <h2 className="mt-3 text-lg font-semibold">{selectedUser.fullName}</h2>
        <p className="text-xs text-gray-400 text-center">{selectedUser.bio}</p>
      </div>

      <h3 className="mt-6 mb-2 text-sm font-medium">Media Shared</h3>
      <div className="grid grid-cols-2 gap-2">
        {userMessages.map((msg, idx) => msg.image && (
          <img key={idx} src={msg.image} alt="media" className="w-full h-20 object-cover rounded-lg" />
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;
