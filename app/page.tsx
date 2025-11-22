import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-b from-surface-dark via-surface to-surface-dark">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      {/* Main Content - Centered Container */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-1 flex-col">
        <Chat />
      </div>
    </div>
  );
}
