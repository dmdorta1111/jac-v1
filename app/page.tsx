import { ClaudeChat } from "@/components/ClaudeChat";

export default function Home() {
  return (
    <div className="relative flex h-full w-full flex-col bg-background/80 dark:bg-background/90  overflow-hidden">
      {/* Subtle background pattern - Enhanced for depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-neutral-500/10  blur-3xl animate-float" />
        <div className="absolute -bottom-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-neutral-600/10 blur-3xl " />
        <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-neutral-400/5 blur-3xl " />
      </div>

      {/* Subtle grid pattern for depth
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)]" />}
      {/* Main Content - Full Width Container */}
      <div className="relative z-10 flex h-full w-full flex-1 flex-col overflow-hidden">
        <ClaudeChat />
      </div>
    </div>
  );
}
