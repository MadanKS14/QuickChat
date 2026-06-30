import { useNavigate } from "react-router-dom";
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
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-white/10 ${
        danger ? "hover:bg-red-500/10" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-lg ${
            danger
              ? "bg-red-500/20 text-red-400"
              : "bg-violet-500/20 text-violet-400"
          }`}
        >
          <Icon size={20} />
        </div>

        <div className="text-left">
          <h3 className="text-white font-medium">{title}</h3>

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

const Toggle = ({ checked }) => (
  <div
    className={`w-12 h-7 rounded-full transition flex items-center px-1 ${
      checked ? "bg-violet-600" : "bg-gray-600"
    }`}
  >
    <div
      className={`w-5 h-5 rounded-full bg-white transition ${
        checked ? "translate-x-5" : ""
      }`}
    />
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black/5 px-4 md:px-10 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition"
          >
            <ArrowLeft className="text-white" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Settings className="text-violet-400" />
              Settings
            </h1>

            <p className="text-white/50 mt-1">
              Customize your QuickChat experience
            </p>
          </div>
        </div>

        {/* Account */}

        <div className="rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-5">
            Account
          </h2>

          <SettingRow
            icon={User}
            title="Edit Profile"
            subtitle="Update your profile information"
          />

          <SettingRow
            icon={Lock}
            title="Change Password"
            subtitle="Keep your account secure"
          />

          <SettingRow
            icon={LogOut}
            title="Logout"
            subtitle="Sign out from this device"
            danger
          />
        </div>

        {/* Appearance */}

        <div className="rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-5">
            Appearance
          </h2>

          <SettingRow
            icon={Moon}
            title="Dark Mode"
            subtitle="Currently enabled"
            right={<Toggle checked />}
          />

          <SettingRow
            icon={Palette}
            title="Theme Color"
            subtitle="Purple"
          />
        </div>

        {/* Chat */}

        <div className="rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10 p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-5">
            Chat
          </h2>

          <SettingRow
            icon={Keyboard}
            title="Enter to Send"
            subtitle="Press Enter to send messages"
            right={<Toggle checked />}
          />

          <SettingRow
            icon={CheckCheck}
            title="Read Receipts"
            subtitle="Show message seen status"
            right={<Toggle checked />}
          />
        </div>

        {/* About */}

        <div className="rounded-3xl bg-black/20 backdrop-blur-xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Info className="text-violet-400" />

            <h2 className="text-xl font-semibold text-white">
              About
            </h2>
          </div>

          <div className="space-y-3 text-white/70">

            <div className="flex justify-between">
              <span>Application</span>
              <span className="font-medium text-white">
                QuickChat
              </span>
            </div>

            <div className="flex justify-between">
              <span>Version</span>
              <span>1.0.0</span>
            </div>

            <div className="flex justify-between">
              <span>Developer</span>
              <span>Madan K S</span>
            </div>

            <div className="flex justify-between">
              <span>Built With</span>

              <span className="text-right">
                React • Node.js
                <br />
                Express • MongoDB
                <br />
                Socket.IO • Tailwind CSS
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;