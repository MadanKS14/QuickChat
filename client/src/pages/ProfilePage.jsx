import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState('Martin James');
  const [bio, setBio] = useState('Hi everyone, I am using QuickChat');
  const navigate = useNavigate();

  const handleSubmit = async (e)=>{
    e.preeventdefault();
    navigate('/')
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: `url(${assets.bgImage})` }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

      <div className="relative w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg shadow-lg">
        {/* Form Section */}
        <form className="flex flex-col gap-5 p-10 flex-1">
          <h3 className="text-lg font-semibold text-white">Profile Details</h3>

          {/* Avatar Upload */}
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : assets.avatar_icon
              }
              alt="Avatar"
              className={`w-16 h-16 rounded-full border-2 border-gray-400 object-cover ${
                selectedImg ? 'shadow-lg' : ''
              }`}
            />
            <span className="text-sm text-gray-200">
              {selectedImg ? 'Change Photo' : 'Upload Photo'}
            </span>
          </label>

          {/* Name Input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="p-3 rounded-lg bg-white/20 placeholder-gray-300 text-white outline-none"
          />

          {/* Bio Input */}
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            rows={3}
            className="p-3 rounded-lg bg-white/20 placeholder-gray-300 text-white outline-none resize-none"
          ></textarea>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium"
          >
            Save & Continue
          </button>
        </form>

        {/* Side Illustration */}
        <img
          src={assets.logo_big}
          alt="QuickChat Logo"
          className="w-[min(30vw,200px)] p-6"
        />
      </div>
    </div>
  );
};

export default ProfilePage;
