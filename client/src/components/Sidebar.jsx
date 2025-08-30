import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets, { userDummyData } from '../assets/assets';

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = userDummyData.filter((user) =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? 'max-md:hidden' : ''}`}>
      {/* Header */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="menu" className="max-h-5 cursor-pointer" />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p onClick={() => navigate('/profile')} className="cursor-pointer text-sm">Edit Profile</p>
              <hr className="my-2 border-t border-gray-500" />
              <p className="cursor-pointer text-sm">Logout</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#282142] mt-4 rounded-full flex items-center gap-2 px-3 py-1">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search User..."
            className="bg-transparent border-none outline-none text-white text-xs flex-1 placeholder-[#c8c8c8]"
          />
        </div>
      </div>

      {/* Users */}
      <div className="flex flex-col gap-3 mt-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`relative flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedUser?._id === user._id ? 'bg-[#282142]' : 'hover:bg-[#282142]'}`}
            >
              <img src={user.profilePic || assets.avatar_icon} alt={user.fullName} className="w-[35px] aspect-[1/1] rounded-full" />
              <div className="flex flex-col leading-5">
                <p className="text-sm">{user.fullName}</p>
                <span className={`text-xs ${index < 3 ? 'text-green-400' : 'text-gray-400'}`}>{index < 3 ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center mt-5">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
