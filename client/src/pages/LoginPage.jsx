import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import assets from "../assets/assets";

const LoginPage = () => {
    // Destructure signup from useAuth as well
    const { login, signup, authUser } = useAuth();
    const navigate = useNavigate();

    const [currState, setCurrState] = useState("Sign Up");
    const [step, setStep] = useState(1);
    
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authUser) navigate("/");
    }, [authUser, navigate]);

    const handleNextStep = (e) => {
        e.preventDefault();
        if (fullName && email && password) setStep(2);
    };

    // --- CORRECTED ---
    // Now calls the new 'signup' function with the correct data object
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (!agree) return;
        setLoading(true);
        try {
            await signup({ fullName, email, password, bio });
        } catch (error) {
            console.error("Signup failed on page");
        } finally {
            setLoading(false);
        }
    };

    // --- CORRECTED ---
    // Now calls 'login' with a single credentials object
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login({ email, password });
        } catch (error) {
            console.error("Login failed on page");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-cover bg-center filter blur-xl"
                style={{ backgroundImage: `url(${assets.bgImage})` }}
            ></div>
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative flex flex-col items-center gap-8 z-10 sm:flex-row sm:justify-evenly w-full max-w-4xl">
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
                            alt="Toggle Form"
                            title={currState === "Sign Up" ? "Switch to Login" : "Switch to Sign Up"}
                            className="w-5 cursor-pointer transform hover:scale-110 transition-transform"
                            onClick={() => {
                                setCurrState(currState === "Sign Up" ? "Login" : "Sign Up");
                                setStep(1);
                            }}
                        />
                    </div>

                    {currState === "Sign Up" ? (
                        step === 1 ? (
                            <>
                                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                                <button type="submit" className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium">Next</button>
                            </>
                        ) : (
                            <>
                                <textarea placeholder="Write your bio..." value={bio} onChange={(e) => setBio(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none resize-none focus:ring-2 focus:ring-purple-500" rows={3} required />
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-violet-500" />
                                    <span>I agree to{" "} <a href="#" className="underline text-violet-300 hover:text-violet-400">Terms & Conditions</a></span>
                                </label>
                                <button type="submit" className={`p-3 rounded-lg font-medium transition-colors ${agree ? "bg-violet-500 hover:bg-violet-600 text-white" : "bg-gray-500 cursor-not-allowed text-gray-300"}`} disabled={!agree || loading}>
                                    {loading ? "Signing Up..." : "Finish Sign Up"}
                                </button>
                            </>
                        )
                    ) : (
                        <>
                            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 rounded-lg bg-white/20 placeholder-gray-200 text-white outline-none focus:ring-2 focus:ring-purple-500" required />
                            <button type="submit" className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium" disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </>
                    )}

                    <div className="text-center text-sm text-gray-300 mt-2">
                        {currState === "Sign Up" ? (
                            <p>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    className="font-medium text-violet-300 cursor-pointer hover:underline bg-transparent border-none p-0"
                                    onClick={() => {
                                        setCurrState("Login");
                                        setStep(1);
                                    }}
                                >
                                    Login here
                                </button>
                            </p>
                        ) : (
                            <p>
                                New to here?{" "}
                                <button
                                    type="button"
                                    className="font-medium text-violet-300 cursor-pointer hover:underline bg-transparent border-none p-0"
                                    onClick={() => {
                                        setCurrState("Sign Up");
                                        setStep(1);
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