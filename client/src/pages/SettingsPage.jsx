import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import assets from "../assets/assets";

import {
  ArrowLeft,
  User,
  Lock,
  LogOut,
  Moon,
  Palette,
  Keyboard,
  CheckCheck,
  ChevronRight,
  Settings,
  Info,
} from "lucide-react";

const Toggle = ({ checked, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition duration-300 ${
        checked ? "bg-violet-600" : "bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-300 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
};

const SettingRow = ({
  icon: Icon,
  title,
  subtitle,
  right,
  danger = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-300 hover:bg-white/10 ${
        danger ? "hover:bg-red-500/10" : ""
      }`}
    >
      <div className="flex items-center gap-4" min-w-0>
        <div
          className={`rounded-xl p-3 ${
            danger
              ? "bg-red-500/20 text-red-400"
              : "bg-violet-500/20 text-violet-400"
          }`}
        >
          <Icon size={20} />
        </div>

        <div className="text-left">
          <h3 className="font-semibold text-white">{title}</h3>

          {subtitle && (
            <p className="text-sm text-white/50">{subtitle}</p>
          )}
        </div>
      </div>

      {right ? (
        right
      ) : (
        <ChevronRight
          size={18}
          className="text-white/40"
        />
      )}
    </button>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();

  const { authUser, logout } = useAuth();

  const [darkMode, setDarkMode] = useState(true);
  const [enterToSend, setEnterToSend] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  const [theme, setTheme] = useState("purple");

  return (
    <div className="min-h-screen bg-black/5 px-4 py-8 md:px-8 lg:px-16">

      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div className="mb-8 flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl transition hover:bg-white/10"
          >
            <ArrowLeft className="text-white" />
          </button>

          <div>

            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-white">
              <Settings className="text-violet-400" />
              Settings
            </h1>

            <p className="mt-1 text-white/50">
              Customize your QuickChat experience
            </p>

          </div>

        </div>

        {/* Profile Card */}

        <div className="mb-8 rounded-3xl border border-white/10 bg-black/20 p-5 sm:p-8 text-center backdrop-blur-xl shadow-xl">

          <img
            src={authUser?.profilePic || assets.avatar_icon}
            alt={authUser?.fullName}
            className="mx-auto h-28 w-28 rounded-full border-4 border-violet-500 object-cover shadow-lg"
          />

          <h2 className="mt-5 text-2xl font-bold text-white">
            {authUser?.fullName}
          </h2>

          <p className="mt-2 text-white/60">
            {authUser?.email}
          </p>

          <p className="mt-4 italic text-white/40">
            Keep chatting. Stay connected 💜
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="rounded-2xl bg-white/5 p-4">

              <h3 className="text-xl font-bold text-violet-400">
                1.0
              </h3>

              <p className="text-xs text-white/50">
                Version
              </p>

            </div>

            <div className="rounded-2xl bg-white/5 p-4">

              <h3 className="text-xl font-bold text-violet-400">
                MERN
              </h3>

              <p className="text-xs text-white/50">
                Stack
              </p>

            </div>

            <div className="rounded-2xl bg-white/5 p-4">

              <h3 className="text-xl font-bold text-violet-400">
                Chat
              </h3>

              <p className="text-xs text-white/50">
                Application
              </p>

            </div>

          </div>

        </div>

        {/* Account */}

        <div className="mb-6 rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-xl">

          <h2 className="mb-5 text-xl font-bold text-white">
            Account
          </h2>

          <SettingRow
            icon={User}
            title="Edit Profile"
            subtitle="Update your profile information"
            onClick={() => navigate("/profile")}
          />

          <SettingRow
            icon={Lock}
            title="Change Password"
            subtitle="Keep your account secure"
          />

          <SettingRow
            icon={LogOut}
            title="Logout"
            subtitle="Logout from QuickChat"
            danger
            onClick={logout}
          />

        </div>

        {/* Appearance */}

        <div className="mb-6 rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-xl">

          <h2 className="mb-5 text-xl font-bold text-white">
            Appearance
          </h2>

          <SettingRow
            icon={Moon}
            title="Dark Mode"
            subtitle="Enable dark theme"
            right={
              <Toggle
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            }
          />

          <div className="mt-4 rounded-2xl px-4 py-4 transition hover:bg-white/10">

            <div className="mb-4 flex items-center gap-4">

              <div className="rounded-xl bg-violet-500/20 p-3 text-violet-400">
                <Palette size={20} />
              </div>

              <div>

                <h3 className="font-semibold text-white">
                  Theme Color
                </h3>

                <p className="text-sm text-white/50">
                  Choose your accent color
                </p>

              </div>

            </div>

            <div className="flex gap-4">

              <button
                onClick={() => setTheme("purple")}
                className={`h-8 w-8 rounded-full bg-violet-500 ${
                  theme === "purple"
                    ? "ring-4 ring-white"
                    : ""
                }`}
              />

              <button
                onClick={() => setTheme("blue")}
                className={`h-8 w-8 rounded-full bg-blue-500 ${
                  theme === "blue"
                    ? "ring-4 ring-white"
                    : ""
                }`}
              />

              <button
                onClick={() => setTheme("green")}
                className={`h-8 w-8 rounded-full bg-green-500 ${
                  theme === "green"
                    ? "ring-4 ring-white"
                    : ""
                }`}
              />

            </div>

          </div>

        </div>

                {/* Chat */}

        <div className="mb-6 rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-xl">

          <h2 className="mb-5 text-xl font-bold text-white">
            Chat
          </h2>

          <SettingRow
            icon={Keyboard}
            title="Enter to Send"
            subtitle="Press Enter to send messages"
            right={
              <Toggle
                checked={enterToSend}
                onChange={() => setEnterToSend(!enterToSend)}
              />
            }
          />

          <SettingRow
            icon={CheckCheck}
            title="Read Receipts"
            subtitle="Show message seen status"
            right={
              <Toggle
                checked={readReceipts}
                onChange={() =>
                  setReadReceipts(!readReceipts)
                }
              />
            }
          />

        </div>

        {/* About */}

        <div className="rounded-3xl border border-white/10 bg-black/20 p-6 backdrop-blur-xl">

          <div className="mb-5 flex items-center gap-3">

            <div className="rounded-xl bg-violet-500/20 p-3 text-violet-400">
              <Info size={20} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-white">
                About QuickChat
              </h2>

              <p className="text-sm text-white/50">
                Personal Portfolio Project
              </p>

            </div>

          </div>

          <div className="space-y-4">

            <div className="flex items-center justify-between border-b border-white/10 pb-3">

              <span className="text-white/60">
                Application
              </span>

              <span className="font-medium text-white">
                QuickChat
              </span>

            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-3">

              <span className="text-white/60">
                Version
              </span>

              <span className="text-violet-400 font-semibold">
                v1.0.0
              </span>

            </div>

            <div className="flex items-center justify-between border-b border-white/10 pb-3">

              <span className="text-white/60">
                Developer
              </span>

              <span className="text-white">
                Madan K S
              </span>

            </div>

            <div>

              <p className="mb-4 text-white/60">
                Built With
              </p>

              <div className="flex flex-wrap gap-3">

                {[
                  "React",
                  "Node.js",
                  "Express",
                  "MongoDB",
                  "Socket.IO",
                  "Tailwind CSS",
                  "Cloudinary",
                  "JWT",
                ].map((tech) => (

                  <span
                    key={tech}
                    className="rounded-full bg-violet-500/15 border border-violet-500/20 px-4 py-2 text-sm text-violet-300 transition hover:bg-violet-500/25"
                  >
                    {tech}
                  </span>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-8 text-center">

          <p className="text-sm text-white/40">
            Made with ❤️ using the MERN Stack
          </p>

          <p className="mt-2 text-xs text-white/30">
            © 2026 Madan K S. All Rights Reserved.
          </p>

        </div>

      </div>

    </div>
  );
};

export default SettingsPage;