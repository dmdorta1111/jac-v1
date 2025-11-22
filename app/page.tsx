import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col bg-gradient-to-b from-surface-dark via-surface to-surface-dark dark:from-surface-dark dark:via-surface dark:to-surface-dark light:bg-gradient-to-b light:from-steel-50 light:via-white light:to-steel-50">
      {/* Subtle background pattern - Enhanced for depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl animate-float dark:bg-blue-500/5" />
        <div className="absolute -bottom-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-blue-600/5 blur-3xl dark:bg-blue-600/5" />
        <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-400/3 blur-3xl dark:bg-blue-400/3" />
      </div>

      {/* Subtle grid pattern for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)]" />

      {/* Main Content - Centered Container */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-1 flex-col">
        <Chat />
      </div>
    </div>
  );
}
