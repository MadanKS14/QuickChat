import { useState } from "react";
import { Link } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../context/authContext";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  password: "",
  bio: "",
};

const SignupPage = () => {
  const { signup } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await signup(formData);
    } catch (err) {
      setError(
        err.message || "Couldn't create your account. Please try again."
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

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-xl w-full max-w-md flex flex-col gap-4 text-white"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          Create Account
        </h2>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          aria-label="Full name"
          required
          value={formData.fullName}
          onChange={handleFieldChange("fullName")}
          className="p-3 rounded-lg bg-white/10 outline-none placeholder-white/50 focus:ring-2 focus:ring-violet-400 transition-shadow"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          aria-label="Email address"
          required
          value={formData.email}
          onChange={handleFieldChange("email")}
          className="p-3 rounded-lg bg-white/10 outline-none placeholder-white/50 focus:ring-2 focus:ring-violet-400 transition-shadow"
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min. 6 characters)"
          aria-label="Password, minimum 6 characters"
          required
          minLength={6}
          value={formData.password}
          onChange={handleFieldChange("password")}
          className="p-3 rounded-lg bg-white/10 outline-none placeholder-white/50 focus:ring-2 focus:ring-violet-400 transition-shadow"
        />

        <textarea
          name="bio"
          placeholder="Tell us about yourself"
          aria-label="Bio"
          required
          rows={3}
          value={formData.bio}
          onChange={handleFieldChange("bio")}
          className="p-3 rounded-lg bg-white/10 outline-none placeholder-white/50 resize-none focus:ring-2 focus:ring-violet-400 transition-shadow"
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
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-300 hover:text-violet-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;