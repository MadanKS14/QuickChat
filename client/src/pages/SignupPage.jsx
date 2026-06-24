import { useState } from "react";
import { Link } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../context/authContext";

const SignupPage = () => {
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await signup(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center blur-xl"
        style={{ backgroundImage: `url(${assets.bgImage})` }}
      ></div>

      <div className="absolute inset-0 bg-black/40"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/10 backdrop-blur-xl p-8 rounded-xl w-full max-w-md flex flex-col gap-4 text-white"
      >
        <h2 className="text-3xl font-bold text-center">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          required
          value={formData.fullName}
          onChange={(e) =>
            setFormData({
              ...formData,
              fullName: e.target.value,
            })
          }
          className="p-3 rounded-lg bg-white/10 outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          className="p-3 rounded-lg bg-white/10 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
          className="p-3 rounded-lg bg-white/10 outline-none"
        />

        <textarea
          placeholder="Tell us about yourself"
          required
          rows={3}
          value={formData.bio}
          onChange={(e) =>
            setFormData({
              ...formData,
              bio: e.target.value,
            })
          }
          className="p-3 rounded-lg bg-white/10 outline-none resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-violet-500 hover:bg-violet-600 p-3 rounded-lg"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-violet-300 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;