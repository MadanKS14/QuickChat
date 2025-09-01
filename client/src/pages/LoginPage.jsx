import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import assets from "../assets/assets";

const LoginPage = () => {
  const { login, authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currState, setCurrState] = useState("Sign Up"); // "Sign Up" or "Login"
  const [step, setStep] = useState(1); // SignUp step
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [agree, setAgree] = useState(false);

  // --- Redirect to home if already logged in ---
  useEffect(() => {
    if (authUser) navigate("/");
  }, [authUser, navigate]);

  // --- Step 1 → Step 2 SignUp ---
  const handleNextStep = (e) => {
    e.preventDefault();
    if (fullName && email && password) setStep(2);
  };

  // --- Final SignUp Submit ---
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!agree) return;
    await login("signup", { fullName, email, password, bio });
  };

  // --- Login Submit ---
  const handleLogin = async (e) => {
    e.preventDefault();
    await login("login", { email, password });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-xl"
        style={{ backgroundImage: `url(${assets.bgImage})` }}
      ></div>
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative flex flex-col items-center gap-8 z-10 sm:flex-row sm:justify-evenly">
        <img src={assets.logo_big} alt="Logo" className="w-[min(30vw,250px)]" />

        <form
          onSubmit={
            currState === "Sign Up" && step === 2
              ? handleFinalSubmit
              : currState === "Sign Up"
              ? handleNextStep
              : handleLogin
          }
          className="border-2 bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg backdrop-blur-xl w-[min(90%,350px)]"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-medium">{currState}</h2>
            <img
              src={assets.arrow_icon}
              alt="Toggle"
              className="w-5 cursor-pointer"
              onClick={() => {
                setCurrState(currState === "Sign Up" ? "Login" : "Sign Up");
                setStep(1);
              }}
            />
          </div>

          {currState === "Sign Up" ? (
            step === 1 ? (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none"
                  required
                />
                <button className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium">
                  Next
                </button>
              </>
            ) : (
              <>
                <textarea
                  placeholder="Write your bio..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none resize-none"
                  rows={3}
                  required
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="accent-violet-500"
                  />
                  <span>
                    I agree to{" "}
                    <a href="#" className="underline text-violet-300 hover:text-violet-400">
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="underline text-violet-300 hover:text-violet-400">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                <button
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    agree
                      ? "bg-violet-500 hover:bg-violet-600 text-white"
                      : "bg-gray-500 cursor-not-allowed text-gray-300"
                  }`}
                  disabled={!agree}
                >
                  Finish Sign Up
                </button>
              </>
            )
          ) : (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none"
                required
              />
              <button className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium">
                Login
              </button>
            </>
          )}

          <div className="text-center text-sm text-gray-300 mt-2">
            {currState === "Sign Up" ? (
              <>
                Already have an account?{" "}
                <span
                  className="text-violet-300 cursor-pointer hover:underline"
                  onClick={() => {
                    setCurrState("Login");
                    setStep(1);
                  }}
                >
                  Login here
                </span>
              </>
            ) : (
              <>
                New here?{" "}
                <span
                  className="text-violet-300 cursor-pointer hover:underline"
                  onClick={() => {
                    setCurrState("Sign Up");
                    setStep(1);
                  }}
                >
                  Register now
                </span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
