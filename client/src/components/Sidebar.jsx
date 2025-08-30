import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets, { userDummyData } from '../assets/assets';

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = userDummyData.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${selectedUser ? 'max-md:hidden' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center pb-5">
        <img src={assets.logo} alt="logo" className="max-w-40" />
        <div className="relative group">
          <img src={assets.menu_icon} alt="menu" className="max-h-5 cursor-pointer" />
          <div className="absolute top-full right-0 w-32 p-3 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
            <p onClick={() => navigate('/profile')} className="cursor-pointer text-sm">Edit Profile</p>
            <hr className="my-2 border-gray-500"/>
            <p className="cursor-pointer text-sm">Logout</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#282142] rounded-full flex items-center gap-2 px-3 py-1 mb-4">
        <img src={assets.search_icon} alt="Search" className="w-3"/>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search User..."
          className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
        />
      </div>

      {/* Users List */}
      <div className="flex flex-col gap-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                selectedUser?._id === user._id ? 'bg-[#282142]' : 'hover:bg-[#282142]'
              }`}
            >
              <img src={user.profilePic || assets.avatar_icon} alt={user.fullName} className="w-9 h-9 rounded-full"/>
              <div className="flex flex-col">
                <p className="text-sm">{user.fullName}</p>
                <span className={`text-xs ${user._id === filteredUsers[0]._id ? 'text-green-400' : 'text-gray-400'}`}>
                  {user._id === filteredUsers[0]._id ? 'Online' : 'Offline'}
                </span>
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
