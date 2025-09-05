import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import assets from './assets/assets';
import { Toaster } from "react-hot-toast";
import { useAuth } from '../context/AuthContext';

const App = () => {
  // Use the custom hook to get the authUser state
  const { authUser } = useAuth();

  return (
    <div
      className="w-screen h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${assets.bgImage})` }}
    >
      <Toaster />
      
      <Routes>
        {/* If user is logged in, show the page. Otherwise, redirect to login. */}
        <Route 
          path="/" 
          element={authUser ? <HomePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />} 
        />

        {/* If user is NOT logged in, show the login page. Otherwise, redirect to home. */}
        <Route 
          path="/login" 
          element={!authUser ? <LoginPage /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  );
};

export default App;
