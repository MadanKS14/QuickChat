import assets from "../assets/assets";
import { useAuth } from "../context/authContext";

const RightSidebar = ({ selectedUser, messages }) => {
  const { logout } = useAuth();

  if (!selectedUser) return null;

  const userMedia = messages.filter((msg) => {
    const senderId =
      typeof msg.senderId === "object"
        ? msg.senderId?._id?.toString()
        : String(msg.senderId);

    const receiverId =
      typeof msg.receiverId === "object"
        ? msg.receiverId?._id?.toString()
        : String(msg.receiverId);

    const selectedUserId = String(selectedUser._id);

    return (
      (senderId === selectedUserId ||
        receiverId === selectedUserId) &&
      msg.image
    );
  });

  return (
    <aside className="bg-[#282142]/80 backdrop-blur-lg p-5 flex flex-col overflow-y-auto border-l border-white/10">
      <div className="flex flex-col items-center text-center pb-5 border-b border-white/10">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt={selectedUser.fullName}
          className="w-20 h-20 rounded-full object-cover"
        />

        <h2 className="mt-3 text-white font-semibold text-lg">
          {selectedUser.fullName}
        </h2>

        <p className="text-sm text-gray-400 mt-1">
          {selectedUser.bio || "No bio available"}
        </p>
      </div>

      <div className="pt-5 flex-1">
        <p className="text-gray-300 font-semibold mb-3">
          Shared Media ({userMedia.length})
        </p>

        {userMedia.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {userMedia.map((msg) => (
              <a
                key={msg._id}
                href={msg.image}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={msg.image}
                  alt="Shared media"
                  className="w-full h-28 object-cover rounded-lg hover:scale-105 transition-transform"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No media shared yet
          </p>
        )}
      </div>

      <button
        onClick={logout}
        className="mt-5 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg transition-colors"
      >
        Logout
      </button>
    </aside>
  );
};

export default RightSidebar;