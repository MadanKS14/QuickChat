import React, { useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const ChatContainer = () => {
    const { messages, selectedUser, setSelectedUser, sendMessage } = useChat();
    const { authUser, onlineUsers } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !image) return;

        let messageData = { text: newMessage };

        if (image) {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onloadend = () => {
                messageData.image = reader.result;
                sendMessage(messageData);
            };
        } else {
            sendMessage(messageData);
        }
        
        setNewMessage("");
        setImage(null);
        setImageUrl("");
    };
    
    if (!selectedUser) {
        return (
            // --- THIS IS THE CORRECTED LINE ---
            // The initial 'flex' class has been removed to resolve the conflict with 'hidden'.
            // 'md:flex' correctly applies flexbox display only on medium screens and up.
            <div className="hidden md:flex flex-col items-center justify-center gap-2 text-white/50 bg-transparent h-full">
                <img src={assets.logo_icon} alt="Logo" className="w-16 h-16 opacity-50" />
                <p className="text-lg font-medium">Select a user to start chatting</p>
            </div>
        );
    }
    
    const isOnline = onlineUsers?.includes(selectedUser._id);

    return (
        <div className="flex flex-col h-full bg-black/10 backdrop-blur-lg">
            {/* Header */}
            <div className="flex items-center gap-3 py-3 px-4 border-b border-white/10 bg-black/20 flex-shrink-0">
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="Back" className="md:hidden w-6 cursor-pointer" />
                <img src={selectedUser.profilePic || assets.avatar_icon} alt={selectedUser.fullName} className="w-10 h-10 rounded-full object-cover"/>
                <div className="flex-1">
                    <p className="text-lg text-white font-semibold">{selectedUser.fullName}</p>
                    <p className={`text-xs ${isOnline ? "text-green-400" : "text-white/60"}`}>{isOnline ? "Online" : "Offline"}</p>
                </div>
                <img src={assets.help_icon} alt="Info" className="w-6 h-6 cursor-pointer opacity-70" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((msg) => (
                    <div
                        key={msg._id}
                        className={`flex items-start gap-2.5 ${msg.senderId === authUser._id ? 'flex-row-reverse' : ''}`}
                    >
                        {msg.senderId !== authUser._id && (
                            <img src={selectedUser.profilePic || assets.avatar_icon} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <div className={`flex flex-col gap-1 ${msg.senderId === authUser._id ? 'items-end' : ''}`}>
                            <div className={`p-3 rounded-lg max-w-xs ${msg.senderId === authUser._id ? 'bg-purple-600 rounded-br-none' : 'bg-white/10 rounded-bl-none'}`}>
                                {msg.image && <img src={msg.image} alt="media" className="rounded-lg mb-2" />}
                                {msg.text && <p className="text-sm text-white break-words">{msg.text}</p>}
                            </div>
                            <span className="text-xs text-white/50">{formatMessageTime(msg.createdAt)}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Bar */}
            <form onSubmit={handleSendMessage} className="flex flex-col p-3 border-t border-white/10 bg-black/20 flex-shrink-0">
                {imageUrl && (
                    <div className="relative w-24 h-24 mb-2">
                        <img src={imageUrl} alt="preview" className="w-full h-full object-cover rounded-lg" />
                        <button onClick={() => {setImage(null); setImageUrl("");}} className="absolute top-1 right-1 bg-black/50 rounded-full p-1">&times;</button>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                        <input
                            type="text"
                            placeholder="Send a message"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/40"
                        />
                        <input type="file" id="image" accept="image/*" onChange={handleImageChange} hidden />
                        <label htmlFor="image">
                            <img src={assets.gallery_icon} alt="Attach" className="w-5 cursor-pointer opacity-50 hover:opacity-100" />
                        </label>
                    </div>
                    <button type="submit" className="p-0 bg-purple-600 rounded-full h-10 w-10 flex items-center justify-center hover:bg-purple-700 transition-colors">
                        <img src={assets.send_button} alt="Send" className="w-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatContainer;
