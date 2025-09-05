import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../../context/AuthContext";
const ProfilePage = () => {
    // Get user data and the update function from the context
    const { authUser, updateProfile } = useAuth();
    const navigate = useNavigate();

    // State for form inputs
    const [selectedImg, setSelectedImg] = useState(null);
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");

    // Use an effect to populate the form with the user's data once it's loaded
    useEffect(() => {
        if (authUser) {
            setFullName(authUser.fullName);
            setBio(authUser.bio);
        }
    }, [authUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const saveProfile = async (profilePicBase64 = null) => {
            const profileData = { fullName, bio };
            // Only add the profilePic to the data if a new one has been selected
            if (profilePicBase64) {
                profileData.profilePic = profilePicBase64;
            }
            await updateProfile(profileData);
            navigate("/"); // Navigate home after the profile is successfully updated
        };

        if (selectedImg) {
            // If a new image is selected, convert it to a base64 string first
            const reader = new FileReader();
            reader.readAsDataURL(selectedImg);
            reader.onloadend = () => {
                saveProfile(reader.result);
            };
        } else {
            // If no new image, save the other profile data
            saveProfile();
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center relative p-4"
            style={{ backgroundImage: `url(${assets.bgImage})` }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

            <div className="relative w-full max-w-2xl bg-black/20 text-gray-300 border border-white/10 flex flex-col sm:flex-row items-center justify-between rounded-lg shadow-lg backdrop-blur-xl">
                <form
                    className="flex flex-col gap-5 p-8 flex-1 w-full"
                    onSubmit={handleSubmit}
                >
                    <h3 className="text-lg font-semibold text-white">Profile Details</h3>
                    <label htmlFor="avatar" className="flex items-center gap-4 cursor-pointer">
                        <input
                            onChange={(e) => setSelectedImg(e.target.files[0])}
                            type="file"
                            id="avatar"
                            accept=".png, .jpg, .jpeg"
                            hidden
                        />
                        <img
                            src={selectedImg ? URL.createObjectURL(selectedImg) : authUser?.profilePic || assets.avatar_icon}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full border-2 border-gray-400 object-cover"
                        />
                        <span className="text-sm text-gray-200 hover:text-white">
                            {selectedImg ? "Change Photo" : "Upload Photo"}
                        </span>
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Name"
                        className="p-3 rounded-lg bg-white/10 placeholder-gray-400 text-white outline-none focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write something about yourself..."
                        rows={3}
                        className="p-3 rounded-lg bg-white/10 placeholder-gray-400 text-white outline-none resize-none focus:ring-2 focus:ring-purple-500"
                        required
                    ></textarea>
                    <button
                        type="submit"
                        className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium"
                    >
                        Save & Continue
                    </button>
                </form>
                <div className="p-6">

                    <img src={authUser?.profilePic || assets.logo_big} alt="Logo" className='max-w-44 aspect-square rounded-full object-cover mx-10 max-sm:mt-10' />                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
