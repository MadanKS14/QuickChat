import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useAuth } from "../context/authContext";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg"];

const ProfilePage = () => {
  const { authUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authUser) return;

    setFullName(authUser.fullName || "");
    setBio(authUser.bio || "");
  }, [authUser]);

  const previewUrl = useMemo(
    () => (selectedImg ? URL.createObjectURL(selectedImg) : null),
    [selectedImg]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError("Please upload a PNG or JPEG image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setImageError("");
    setSelectedImg(file);
  };

  const readAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSubmitError("");
    setSaving(true);

    try {
      const profileData = { fullName, bio };

      if (selectedImg) {
        profileData.profilePic = await readAsDataUrl(selectedImg);
      }

      const success = await updateProfile(profileData);

      if (success) {
        navigate("/");
      } else {
        setSubmitError("Couldn't save your profile. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative p-4"
      style={{ backgroundImage: `url(${assets.bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl bg-black/20 text-gray-300 border border-white/10 flex flex-col sm:flex-row items-center justify-between rounded-lg shadow-lg backdrop-blur-xl">
        <form
          className="flex flex-col gap-5 p-6 sm:p-8 flex-1 w-full"
          onSubmit={handleSubmit}
        >
          <h3 className="text-lg font-semibold text-white">Profile Details</h3>

          <div>
            <label
              htmlFor="avatar"
              className="flex items-center gap-4 cursor-pointer"
            >
              <input
                onChange={handleImageChange}
                type="file"
                id="avatar"
                accept="image/png, image/jpeg"
                hidden
              />
              <img
                src={previewUrl || authUser?.profilePic || assets.avatar_icon}
                alt="Your avatar"
                className="w-16 h-16 rounded-full border-2 border-gray-400 object-cover flex-shrink-0"
              />
              <span className="text-sm text-gray-200 hover:text-white">
                {selectedImg ? "Change Photo" : "Upload Photo"}
              </span>
            </label>

            {imageError && (
              <p className="mt-2 text-sm text-red-400" role="alert">
                {imageError}
              </p>
            )}
          </div>

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your Name"
            aria-label="Full name"
            className="p-3 rounded-lg bg-white/10 placeholder-gray-400 text-white outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write something about yourself..."
            aria-label="Bio"
            rows={3}
            className="p-3 rounded-lg bg-white/10 placeholder-gray-400 text-white outline-none resize-none focus:ring-2 focus:ring-purple-500"
            required
          />

          {submitError && (
            <p className="text-sm text-red-400" role="alert">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="p-3 rounded-lg bg-violet-500 hover:bg-violet-600 transition-colors text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </form>

        <div className="p-6">
          <img
            src={authUser?.profilePic || assets.logo_big}
            alt={authUser?.profilePic ? "Current profile photo" : "App logo"}
            className="max-w-36 sm:max-w-44 w-full aspect-square rounded-full object-cover mx-auto sm:mx-10 max-sm:mt-4"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;