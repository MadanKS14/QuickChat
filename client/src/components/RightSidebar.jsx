import React from 'react';
import assets from '../assets/assets';

const RightSidebar = ({ selectedUser, messages }) => {
  
  if (!selectedUser) return null;

  const userMedia = messages.filter(
    msg =>
      (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id) && msg.image
  );

  return (
    <div className="bg-[#282142]/80 p-4 flex flex-col gap-5 overflow-y-auto">
      {/* User Info */}
      <div className="flex flex-col items-center gap-2">
        <img src={selectedUser.profilePic} alt={selectedUser.fullName} className="w-16 rounded-full" />
        <p className="text-white font-medium">{selectedUser.fullName}</p>
        <p className="text-gray-400 text-sm text-center">{selectedUser.bio}</p>
      </div>

      {/* Shared Media */}
      <div>
        <p className="text-gray-300 font-semibold mb-2">Shared Media</p>
        <div className="flex flex-wrap gap-2">
          {userMedia.length > 0 ? (
            userMedia.map((msg, idx) => (
              <a key={idx} href={msg.image} target="_blank" rel="noopener noreferrer">
                <img
                  src={msg.image}
                  alt="media"
                  className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                />
              </a>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No media shared</p>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <button className="mt-auto bg-violet-500 text-white py-2 rounded-lg hover:bg-violet-600 transition">
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;