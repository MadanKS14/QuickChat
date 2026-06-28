import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../context/authContext";

const LoginPage = () => {
  const { login, authUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authUser) navigate("/");
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(
        err.message || "Couldn't log you in. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center blur-xl"
        style={{ backgroundImage: `url(${assets.bgImage})` }}
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 w-full max-w-md">
        <img
          src={assets.logo_big}
          alt="QuickChat"
          className="w-[min(40vw,250px)] sm:w-[min(30vw,250px)]"
        />

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-6 sm:p-8 w-full flex flex-col gap-5 text-white"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center">
            Welcome Back
          </h2>

          <input
            type="email"
            placeholder="Email Address"
            aria-label="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-white/10 outline-none placeholder-white/50 focus:ring-2 focus:ring-violet-400 transition-shadow"
          />

          <input
            type="password"
            placeholder="Password"
            aria-label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-white/10 outline-none placeholder-white/50 focus:ring-2 focus:ring-violet-400 transition-shadow"
          />

          {error && (
            <p className="text-sm text-red-400 text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-violet-500 hover:bg-violet-600 transition-colors p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-300">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-violet-300 hover:text-violet-400 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;