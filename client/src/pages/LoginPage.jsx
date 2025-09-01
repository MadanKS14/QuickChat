import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import assets from "../assets/assets";

const LoginPage = () => {
    const { login, authUser } = useAuth();
    const navigate = useNavigate();

    // This state controls whether the form is for "Sign Up" or "Login"
    const [currState, setCurrState] = useState("Sign Up");
    // This state controls the multi-step process for signing up
    const [step, setStep] = useState(1);
    
    // Form fields state
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [agree, setAgree] = useState(false);

    // If the user is already logged in, redirect them to the home page
    useEffect(() => {
        if (authUser) navigate("/");
    }, [authUser, navigate]);

    // Handler for the first step of signup
    const handleNextStep = (e) => {
        e.preventDefault();
        if (fullName && email && password) setStep(2);
    };

    // Handler for the final signup submission
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!agree) return;
        await login("signup", { fullName, email, password, bio });
    };

    // Handler for the login submission
    const handleLogin = async (e) => {
        e.preventDefault();
        await login("login", { email, password });
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4">
            {/* Background Image and Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center filter blur-xl"
                style={{ backgroundImage: `url(${assets.bgImage})` }}
            ></div>
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative flex flex-col items-center gap-8 z-10 sm:flex-row sm:justify-evenly w-full max-w-4xl">
                {/* Logo */}
                <img src={assets.logo_big} alt="Logo" className="w-[min(30vw,250px)]" />

                {/* Form */}
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
                    {/* Form Header */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-medium">{currState}</h2>
                        <img
                            src={assets.arrow_icon}
                            alt="Toggle Form"
                            title={currState === "Sign Up" ? "Switch to Login" : "Switch to Sign Up"}
                            className="w-5 cursor-pointer transform hover:scale-110 transition-transform"
                            onClick={() => {
                                setCurrState(currState === "Sign Up" ? "Login" : "Sign Up");
                                setStep(1); // Reset to step 1 when toggling
                            }}
                        />
                    </div>

                    {/* Form Body: Conditional rendering based on currState and step */}
                    {currState === "Sign Up" ? (
                        step === 1 ? (
                            // Signup Step 1
                            <>
                                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                                <button type="submit" className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium">Next</button>
                            </>
                        ) : (
                            // Signup Step 2
                            <>
                                <textarea placeholder="Write your bio..." value={bio} onChange={(e) => setBio(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none resize-none focus:ring-2 focus:ring-purple-500" rows={3} required />
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-violet-500" />
                                    <span>I agree to{" "} <a href="#" className="underline text-violet-300 hover:text-violet-400">Terms & Conditions</a></span>
                                </label>
                                <button type="submit" className={`p-3 rounded-lg font-medium transition-colors ${agree ? "bg-violet-500 hover:bg-violet-600 text-white" : "bg-gray-500 cursor-not-allowed text-gray-300"}`} disabled={!agree}>Finish Sign Up</button>
                            </>
                        )
                    ) : (
                        // Login Form
                        <>
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                            <button type="submit" className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium">Login</button>
                        </>
                    )}

                    {/* --- FEATURE: Toggle between Login and Sign Up --- */}
                    <div className="text-center text-sm text-gray-300 mt-2">
                        {currState === "Sign Up" ? (
                            <p>
                                Already have an account?{" "}
                                <button
                                    type="button" // Use type="button" to prevent form submission
                                    className="font-medium text-violet-300 cursor-pointer hover:underline bg-transparent border-none p-0"
                                    onClick={() => {
                                        setCurrState("Login");
                                        setStep(1); // Reset to step 1
                                    }}
                                >
                                    Login here
                                </button>
                            </p>
                        ) : (
                            <p>
                                New to here?{" "}
                                <button
                                    type="button" // Use type="button" to prevent form submission
                                    className="font-medium text-violet-300 cursor-pointer hover:underline bg-transparent border-none p-0"
                                    onClick={() => {
                                        setCurrState("Sign Up");
                                        setStep(1); // Reset to step 1
                                    }}
                                >
                                    Register now
                                </button>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

