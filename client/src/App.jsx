import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import assets from "./assets/assets";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";

import { useAuth } from "./context/authContext";

const App = () => {
  const { authUser } = useAuth();

  const isAuthenticated = Boolean(authUser);

  return (
    <div
      className="min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${assets.bgImage})`,
      }}
    >
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />

      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <HomePage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <ProfilePage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignupPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </div>
  );
};

export default App;