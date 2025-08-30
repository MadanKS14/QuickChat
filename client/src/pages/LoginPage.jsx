import React, { useState } from 'react';
import assets from '../assets/assets';

const LoginPage = () => {
  const [currState, setCurrState] = useState('Sign Up');

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-xl"
        style={{ backgroundImage: `url(${assets.bgImage})` }}
      ></div>

      {/* Dim overlay for contrast */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Main Container */}
      <div className="relative flex flex-col items-center gap-8 z-10 sm:flex-row sm:justify-evenly">
        {/* QuickChat Logo */}
        <img
          src={assets.logo_big}
          alt="QuickChat Logo"
          className="w-[min(30vw,250px)]"
        />

        {/* Login Form */}
        <form className="border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg backdrop-blur-xl">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-medium">{currState}</h2>
            <img
              src={assets.arrow_icon}
              alt="Toggle"
              className="w-5 cursor-pointer"
              onClick={() =>
                setCurrState(currState === 'Sign Up' ? 'Login' : 'Sign Up')
              }
            />
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-4">
            {currState === 'Sign Up' && (
              <input
                type="text"
                placeholder="Full Name"
                className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none"
            />
          </div>

          {/* Submit Button */}
          <button className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium">
            {currState}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
