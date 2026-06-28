import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useChat } from "../context/chatContext";

const HomePage = () => {
  const { selectedUser, messages } = useChat();

  const layoutClasses = selectedUser
    ? "md:grid-cols-[320px_1fr_320px] xl:grid-cols-[340px_1fr_340px]"
    : "md:grid-cols-[320px_1fr]";

  return (
    <main className="min-h-screen w-full bg-black/5 p-0 sm:p-4 lg:p-6">
      <section
        className={`
          grid
          h-screen
          sm:h-[calc(100vh-2rem)]
          lg:h-[calc(100vh-3rem)]
          overflow-hidden
          rounded-none
          sm:rounded-2xl
          border
          border-white/10
          bg-black/20
          backdrop-blur-lg
          ${layoutClasses}
        `}
      >
        <Sidebar />

        <ChatContainer />

        {selectedUser && (
          <RightSidebar
            selectedUser={selectedUser}
            messages={messages}
          />
        )}
      </section>
    </main>
  );
};

export default HomePage;