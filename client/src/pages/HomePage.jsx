import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useChat } from "../context/chatContext";

const HomePage = () => {
  const { selectedUser, messages } = useChat();

  return (
    <div className="w-full h-screen sm:px-[5%] sm:py-[3%] bg-black/5">
      <div
        className={`grid h-full overflow-hidden rounded-2xl border border-white/10 ${
          selectedUser
            ? "md:grid-cols-[1fr_2fr_1fr] xl:grid-cols-[1fr_3fr_1fr]"
            : "md:grid-cols-2"
        }`}
      >
        <Sidebar />

        <ChatContainer />

        {selectedUser && (
          <RightSidebar
            selectedUser={selectedUser}
            messages={messages}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;