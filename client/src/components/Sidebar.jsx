import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

const Sidebar = () => {
    const { authUser, logout, onlineUsers } = useAuth();
    const { users, setSelectedUser, selectedUser, unseenMessages, getMessages, setUnseenMessages } = useChat();
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    // The user list is now filtered based on the search input
    const filteredUsers = input
        ? users.filter((user) =>
            user.fullName.toLowerCase().includes(input.toLowerCase())
        )
        : users;

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        getMessages(user._id);
        
        // When a user is selected, clear their unseen messages count
        if (unseenMessages[user._id]) {
            setUnseenMessages(prev => {
                const newUnseen = { ...prev };
                delete newUnseen[user._id];
                return newUnseen;
            });
        }
    };

    return (
        <div className="bg-black/20 backdrop-blur-lg h-full p-4 text-white flex flex-col border-r border-white/10">
            {/* Header with Profile Dropdown */}
            <div className="flex items-center justify-between pb-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <img src={assets.logo_icon} alt="logo" className="w-8 h-8" />
                    <h1 className="text-xl font-bold">QuickChat</h1>
                </div>
                <div className="relative group">
                    <img
                        src={authUser?.profilePic || assets.avatar_icon}
                        alt="My Profile"
                        className="w-8 h-8 rounded-full cursor-pointer object-cover"
                    />
                    <div className="absolute top-full right-0 w-40 p-2 rounded-md bg-[#282142] border border-white/10 text-white/80 hidden group-hover:block z-20">
                        <p onClick={() => navigate("/profile")} className="cursor-pointer text-sm p-2 hover:bg-white/10 rounded">
                            Edit Profile
                        </p>
                        <hr className="my-1 border-white/10" />
                        <p onClick={logout} className="cursor-pointer text-sm p-2 hover:bg-white/10 rounded">
                            Logout
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white/5 rounded-full flex items-center gap-2 px-3 py-2 mb-4 flex-shrink-0 border border-white/10">
                <img src={assets.search_icon} alt="Search" className="w-4 h-4 opacity-50" />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search users..."
                    className="bg-transparent border-none outline-none text-white text-sm placeholder-white/40 flex-1"
                />
            </div>

            {/* User List */}
            <div className="flex flex-col gap-1 overflow-y-auto flex-grow pr-1">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                        const isOnline = onlineUsers?.includes(user._id);
                        const unseenCount = unseenMessages[user._id] || 0;

                        return (
                            <div
                                key={user._id}
                                onClick={() => handleSelectUser(user)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 border-2 ${selectedUser?._id === user._id
                                        ? "bg-white/20 border-white/30"
                                        : "border-transparent hover:bg-white/10"
                                    }`}
                            >
                                <div className="relative">
                                    <img
                                        src={user.profilePic || assets.avatar_icon}
                                        alt={user.fullName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    {isOnline && (
                                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-gray-800"></span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{user.fullName}</p>
                                    <p className={`text-xs ${isOnline ? "text-green-400" : "text-white/60"}`}>
                                        {isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>
                                {unseenCount > 0 && (
                                    <div className="bg-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unseenCount}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-white/50 text-sm text-center mt-5">No users found</p>
                )}
            </div>
        </div>
    );
};

export default Sidebar;