"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  User,
  AlertCircle,
  Workflow,
  X,
} from "lucide-react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import {
  Message as MessageComponent,
  MessageContent,
  MessageResponse,
  MessageAttachment,
  MessageAttachments,
} from "@/components/ai-elements/message";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
} from "@/components/ai-elements/task";
import {
  projectSetupExample,
  codeAnalysisExample,
  dataProcessingExample,
  featureDevelopmentExample,
  bugFixExample,
} from "@/components/ai-elements/examples";
import {
  LeftSidebar,
  type ChatSession,
  type Message,
  type UploadedFile,
} from "@/components/leftsidebar";

const suggestions = [
  "SDI",
  "EMJAC",
  "Harmonic",
];

export function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Save current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setChatSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages,
                updatedAt: new Date(),
                title: generateSessionTitle(messages),
              }
            : session
        )
      );
    }
  }, [messages, currentSessionId]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const generateSessionTitle = (msgs: Message[]): string => {
    const firstUserMsg = msgs.find((m) => m.sender === "user");
    if (firstUserMsg) {
      return firstUserMsg.text.slice(0, 40) + (firstUserMsg.text.length > 40 ? "..." : "");
    }
    return "New Chat";
  };

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setError(null);
  };

  const selectSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setError(null);
    }
  };

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if ((!message.text.trim() && message.files.length === 0) || isLoading) return;

    // Start a new session if none exists
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: generateId(),
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChatSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
    }

    // Convert FileUIPart files to UploadedFile format
    const convertedFiles: UploadedFile[] = message.files.map((file) => ({
      id: generateId(),
      name: file.filename || "file",
      size: 0,
      type: file.mediaType || "",
    }));

    const userMessage: Message = {
      id: generateId(),
      sender: "user",
      text: message.text.trim(),
      timestamp: new Date(),
      files: convertedFiles.length > 0 ? convertedFiles : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Check for example triggers
    const lowerText = message.text.trim().toLowerCase();
    
    if (lowerText.includes("project setup") || lowerText.includes("setup example")) {
      setMessages((prev) => [...prev, projectSetupExample]);
      setIsLoading(false);
      return;
    }
    if (lowerText.includes("code analysis") || lowerText.includes("analyze code")) {
      setMessages((prev) => [...prev, codeAnalysisExample]);
      setIsLoading(false);
      return;
    }
    if (lowerText.includes("data processing") || lowerText.includes("process data")) {
      setMessages((prev) => [...prev, dataProcessingExample]);
      setIsLoading(false);
      return;
    }
    if (lowerText.includes("feature development") || lowerText.includes("develop feature")) {
      setMessages((prev) => [...prev, featureDevelopmentExample]);
      setIsLoading(false);
      return;
    }
    if (lowerText.includes("bug fix") || lowerText.includes("fix bug")) {
      setMessages((prev) => [...prev, bugFixExample]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: message.text.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const botMessage: Message = {
        id: generateId(),
        sender: "bot",
        text: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setError("Failed to get response. Please try again.");
      const errorMessage: Message = {
        id: generateId(),
        sender: "bot",
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full relative">
      {/* Left Sidebar */}
      <LeftSidebar
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onNewChat={startNewChat}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col items-center w-full">
        {/* Messages Area */}
        <div className="w-full flex-1 overflow-y-auto px-6 py-4 sm:px-8">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={(text) => handleSubmit({ text, files: [] })} />
          ) : (
            <div className="mx-auto max-w-4xl space-y-8">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div
            role="alert"
            className="mx-auto w-full max-w-4xl flex items-center gap-3 rounded-lg bg-red-50 px-6 py-3 text-sm text-red-600 shadow-md dark:bg-destructive/10 dark:text-red-400"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="rounded-md p-1.5 transition-colors hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="w-full shrink-0 border-slate-200 px-6 py-3 backdrop-blur-sm dark:border-border dark:bg-background sm:px-8">
          <div className="mx-auto w-full max-w-4xl">
            {/* Input Container with Glow Effect */}
            <div className="relative">
              {/* Subtle Glow Behind */}
              <div
                className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-600/20 blur-xl duration-500 ${
                  isLoading ? "opacity-80" : "opacity-30"
                }`}
              />

              {/* Main Input Container */}
              <PromptInput
                onSubmit={handleSubmit}
                className="relative rounded-2xl bg-gradient-to-b from-slate-100 to-slate-50 p-1.5 shadow-lg transition-all duration-300 dark:bg-card dark:bg-none dark:shadow-xl dark:shadow-black/20"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                multiple
              >
                <PromptInputAttachments>
                  {(attachment) => (
                    <PromptInputAttachment
                      key={attachment.id}
                      data={attachment}
                    />
                  )}
                </PromptInputAttachments>
                <PromptInputTextarea
                  placeholder="Jac is Waiting..."
                  disabled={isLoading}
                />
                <PromptInputFooter>
                  <PromptInputTools>
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger />
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                  </PromptInputTools>                
                  <PromptInputSubmit
                    disabled={isLoading}
                    status={isLoading ? "submitted" : "ready"}
                  />
                </PromptInputFooter>
              </PromptInput>             
            </div>
            {/* Workflow Navigation Button */}
            <button
              onClick={() => router.push("/workflow")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
              title="Open Workflow Visualization"
            >
              <Workflow className="h-4 w-4" />
              <span>Workflow</span>
            </button>           
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick?: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 sm:px-8">
      <h2 className="mb-3 text-3xl font-bold text-slate-800 dark:text-foreground">
        EMJAC Engineering Assistant
      </h2>
      <p className="mb-12 max-w-xl text-center text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
        Your AI-powered helper for custom stainless steel fabrication projects.
        Ask about kitchen equipment, specifications, or engineering details.
      </p>

      <div className="grid w-full max-w-3xl gap-4 justify-center">
        <Suggestions>
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              onClick={() => onSuggestionClick?.(suggestion)}
              suggestion={suggestion}
              className="group cursor-pointer border-slate-200 bg-white shadow-md transition-all duration-300 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-border dark:bg-card dark:shadow-lg dark:hover:border-blue-500 dark:hover:bg-secondary"
            />
          ))}
        </Suggestions>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";
  const role = isUser ? "user" : "assistant";
  const hasReasoning = !isUser && message.reasoning && message.reasoning.length > 0;

  return (
    <div
      className={`flex items-start gap-4 animate-slide-up ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20"
            : "bg-slate-200 text-blue-600 shadow-md dark:bg-card dark:text-blue-400 dark:shadow-black/20"
        }`}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message Content */}
      <MessageComponent from={role} className="max-w-[75%]">
        <MessageContent
          className={`rounded-2xl px-6 py-4 shadow-lg ${
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
              : "bg-slate-100 text-slate-800 shadow-md dark:bg-card dark:text-foreground dark:shadow-black/20"
          }`}
        >
          {/* Chain of Thought for bot messages */}
          {hasReasoning && (
            <ChainOfThought className="mb-4">
              <ChainOfThoughtHeader>Reasoning</ChainOfThoughtHeader>
              <ChainOfThoughtContent>
                {message.reasoning!.map((step, index) => (
                  <ChainOfThoughtStep
                    key={index}
                    label={step.label}
                    description={step.description}
                    status={step.status || "complete"}
                  />
                ))}
              </ChainOfThoughtContent>
            </ChainOfThought>
          )}

          {/* Task List for process tracking */}
          {!isUser && message.tasks && message.tasks.length > 0 && (
            <div className="mb-4 space-y-3">
              {message.tasks.map((task) => {
                const statusColorMap = {
                  pending: "text-muted-foreground",
                  active: "text-blue-600 dark:text-blue-400",
                  complete: "text-green-600 dark:text-green-400",
                };
                const statusBgMap = {
                  pending: "bg-slate-200/50 dark:bg-slate-800/50",
                  active: "bg-blue-100/50 dark:bg-blue-950/50",
                  complete: "bg-green-100/50 dark:bg-green-950/50",
                };
                return (
                  <Task key={task.id} defaultOpen={task.status === "active"}>
                    <TaskTrigger
                      title={task.title}
                      className={`rounded-lg p-2.5 transition-all ${ statusBgMap[task.status]
                      } hover:opacity-80`}
                    >
                      <div className="flex w-full items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${ task.status === "complete"
                              ? "border-green-600 bg-green-600 dark:border-green-400 dark:bg-green-400"
                              : task.status === "active"
                                ? "border-blue-600 bg-blue-100 dark:border-blue-400 dark:bg-blue-950"
                                : "border-slate-400 bg-transparent dark:border-slate-600"
                          }`}
                        >
                          {task.status === "complete" && (
                            <span className="text-xs font-bold text-white">✓</span>
                          )}
                          {task.status === "active" && (
                            <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                          )}
                        </div>
                        <p
                          className={`flex-1 text-sm font-semibold ${ statusColorMap[task.status]
                          }`}
                        >
                          {task.title}
                        </p>
                        <svg
                          className="size-4 transition-transform group-data-[state=open]:rotate-180"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </div>
                    </TaskTrigger>
                    {task.items && task.items.length > 0 && (
                      <TaskContent className="mt-2">
                        <div className="space-y-2">
                          {task.items.map((item, idx) => (
                            <TaskItem key={idx} className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-muted-foreground">•</span>
                              <span>{item}</span>
                            </TaskItem>
                          ))}
                        </div>
                      </TaskContent>
                    )}
                  </Task>
                );
              })}
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-white">
              {message.text}
            </p>
          ) : (
            <MessageResponse className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-foreground">
              {message.text}
            </MessageResponse>
          )}

          {/* File Attachments */}
          {message.files && message.files.length > 0 && (
            <MessageAttachments className="mt-3 border-t border-slate-300 pt-3 dark:border-white/10">
              {message.files.map((file) => (
                <MessageAttachment
                  key={file.id}
                  data={{
                    type: "file",
                    filename: file.name,
                    mediaType: file.type,
                    url: "",
                  }}
                  className="size-auto flex-row items-center gap-1.5 rounded-lg bg-white/50 px-2.5 py-1.5 text-xs dark:bg-white/10"
                />
              ))}
            </MessageAttachments>
          )}

          <span
            className={`mt-3 block text-xs ${
              isUser ? "text-blue-200" : "text-slate-600 dark:text-muted-foreground"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </MessageContent>
      </MessageComponent>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-4 animate-fade-in" aria-live="polite" aria-label="Jac is typing">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-blue-600 shadow-md dark:bg-card dark:text-blue-400 dark:shadow-lg dark:shadow-black/20">
        <Bot className="h-5 w-5" />
      </div>
      <div className="rounded-2xl bg-slate-100 px-6 py-4 shadow-lg dark:bg-card dark:shadow-black/20">
        <div className="flex items-center gap-2">
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
        </div>
      </div>
    </div>
  );
}
