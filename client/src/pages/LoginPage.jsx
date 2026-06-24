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

  useEffect(() => {
    if (authUser) {
      navigate("/");
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await login({ email, password });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center blur-xl"
        style={{ backgroundImage: `url(${assets.bgImage})` }}
      ></div>

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <img
          src={assets.logo_big}
          alt="QuickChat"
          className="w-[min(30vw,250px)]"
        />

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-8 w-full max-w-md flex flex-col gap-5 text-white"
        >
          <h2 className="text-3xl font-bold text-center">
            Welcome Back
          </h2>

          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-white/10 outline-none placeholder-white/50"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-white/10 outline-none placeholder-white/50"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-violet-500 hover:bg-violet-600 transition-colors p-3 rounded-lg font-medium"
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