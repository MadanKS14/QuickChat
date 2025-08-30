import React from 'react';
import assets from '../assets/assets';

const RightSidebar = ({ selectedUser, messages }) => {
  if (!selectedUser) return null;

  // Get all media sent by this user
  const userMedia = messages.filter(
    msg => msg.senderId === selectedUser._id && msg.image
  );

  return (
    <div className="bg-[#8185B2]/10 h-full p-5 rounded-l-xl overflow-y-auto text-white max-md:hidden">
      {/* User Info */}
      <div className="flex flex-col items-center gap-3 mb-5">
        <img src={selectedUser.profilePic} alt={selectedUser.fullName} className="w-16 h-16 rounded-full"/>
        <p className="text-lg font-semibold">{selectedUser.fullName}</p>
        <p className="text-sm text-gray-300 text-center">{selectedUser.bio}</p>
      </div>

      {/* Media Shared */}
      <h3 className="text-sm text-gray-400 mb-2">Shared Media</h3>
      {userMedia.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {userMedia.map((msg, idx) => (
            <img
              key={idx}
              src={msg.image}
              alt="media"
              className="w-full h-24 object-cover rounded-lg"
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No media shared yet.</p>
      )}
    </div>
  );
};

export default RightSidebar;
