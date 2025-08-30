// App.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import assets from './assets/assets';

const App = () => {
  return (
    <div
      className="w-screen h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${assets.bgImage})` }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
};

export default App;
