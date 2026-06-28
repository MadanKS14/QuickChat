import { useMemo } from "react";
import assets from "../assets/assets";
import { useAuth } from "../context/authContext";

const getParticipantId = (participant) =>
  typeof participant === "object"
    ? participant?._id?.toString()
    : String(participant);

const RightSidebar = ({ selectedUser, messages }) => {
  const { logout } = useAuth();

  const userMedia = useMemo(() => {
    if (!selectedUser) return [];

    const selectedUserId = String(selectedUser._id);

    return messages.filter((msg) => {
      const senderId = getParticipantId(msg.senderId);
      const receiverId = getParticipantId(msg.receiverId);

      return (
        (senderId === selectedUserId || receiverId === selectedUserId) &&
        msg.image
      );
    });
  }, [messages, selectedUser]);

  if (!selectedUser) return null;

  return (
    <aside className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col bg-[#282142]/80 backdrop-blur-lg p-5 overflow-y-auto border-l border-white/10">
      <ProfileSummary selectedUser={selectedUser} />
      <SharedMedia media={userMedia} />

      <button
        type="button"
        onClick={logout}
        className="mt-5 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        Logout
      </button>
    </aside>
  );
};

const ProfileSummary = ({ selectedUser }) => (
  <div className="flex flex-col items-center text-center pb-5 border-b border-white/10">
    <img
      src={selectedUser.profilePic || assets.avatar_icon}
      alt={selectedUser.fullName}
      className="w-20 h-20 rounded-full object-cover"
    />

    <h2 className="mt-3 text-white font-semibold text-lg truncate max-w-full">
      {selectedUser.fullName}
    </h2>

    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
      {selectedUser.bio || "No bio available"}
    </p>
  </div>
);

const SharedMedia = ({ media }) => (
  <div className="pt-5 flex-1">
    <p className="text-gray-300 font-semibold mb-3">
      Shared Media ({media.length})
    </p>

    {media.length > 0 ? (
      <div className="grid grid-cols-2 gap-3">
        {media.map((msg) => (
          <a
            key={msg._id}
            href={msg.image}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open shared image in new tab"
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-lg"
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
      <p className="text-sm text-gray-500">No media shared yet</p>
    )}
  </div>
);

export default RightSidebar;