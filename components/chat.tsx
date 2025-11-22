"use client";

import { useState, useRef, useEffect, useCallback, DragEvent } from "react";
import {
  ArrowUp,
  Paperclip,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Plus,
  X,
  FileText,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  files?: UploadedFile[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

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
    setUploadedFiles([]);
    setError(null);
  };

  const selectSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setUploadedFiles([]);
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

  const handleSend = async () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

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

    const userMessage: Message = {
      id: generateId(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedFiles([]);
    setIsLoading(true);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input.trim() }),
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex h-full w-full ">
      {/* Chat History Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        }  max-sm:hidden lg:w-[266px] light-border sticky left-0 top-0 h-screen flex 
    justify-between overflow-y-auto  p-6 pt-36hidden shrink-0 flex-col border-r border-steel-800/50 bg-steel-950/50 transition-all duration-300 dark:border-steel-800/50 dark:bg-steel-950/50 lg:flex`}
      >
        {sidebarOpen && (
          <>
            {/* New Chat Button */}
            <div className="p-3">
              <button
                onClick={startNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-steel-700/50 bg-steel-900/50 px-4 py-3 text-sm font-medium text-steel-300 transition-all duration-200 hover:border-blue-500/30 hover:bg-steel-800/50 hover:text-blue-400"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-steel-500">
                Recent Chats
              </p>
              <div className="space-y-1">
                {chatSessions.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-steel-600">
                    No chat history yet
                  </p>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => selectSession(session.id)}
                      className={`group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                        currentSessionId === session.id
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-steel-400 hover:bg-steel-800/50 hover:text-steel-200"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-sm">{session.title}</span>
                      <button
                        onClick={(e) => deleteSession(session.id, e)}
                        className="hidden rounded p-1 text-steel-500 opacity-0 transition-all hover:bg-steel-700 hover:text-red-400 group-hover:opacity-100 lg:block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Sidebar Toggle */}
        <div className="flex items-center gap-2 border-b border-steel-800/30 px-4 py-2 lg:hidden">
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 rounded-lg bg-steel-800/50 px-3 py-1.5 text-sm text-steel-300"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
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
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2 text-sm text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Area */}
        <div
          className="border-t border-steel-800/30 px-4 py-4 dark:border-steel-800/30"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto max-w-3xl">
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 rounded-lg bg-steel-800/50 px-3 py-1.5 text-sm"
                  >
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="max-w-[150px] truncate text-steel-300">{file.name}</span>
                    <span className="text-xs text-steel-500">({formatFileSize(file.size)})</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-1 rounded p-0.5 text-steel-500 hover:bg-steel-700 hover:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Container with Glow Effect */}
            <div className="relative">
              {/* Subtle Glow Behind */}
              <div
                className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-600/20 blur-xl transition-opacity duration-500 ${
                  isLoading ? "opacity-80" : "opacity-30"
                }`}
              />

              {/* Main Input Container */}
              <div
                className={`relative rounded-2xl bg-gradient-to-b from-steel-800/90 to-steel-900/90 p-1 shadow-lg shadow-black/20 transition-all duration-300 dark:from-steel-800/90 dark:to-steel-900/90 ${
                  isDragging ? "ring-2 ring-blue-500/50" : ""
                }`}
              >
                <div className="flex items-end gap-2 rounded-xl bg-gradient-to-b from-steel-800/50 to-steel-850/50 p-2 dark:from-steel-800/50 dark:to-steel-900/80">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                  />

                  {/* File Upload Button */}
                  <button
                    onClick={handleFileUpload}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-steel-400 transition-all duration-200 hover:bg-steel-700/50 hover:text-blue-400 active:scale-95"
                    aria-label="Attach file"
                    title="Upload files (drag & drop also supported)"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  {/* Text Input */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isDragging
                        ? "Drop files here..."
                        : "Ask about stainless steel fabrication, kitchen equipment, or engineering specifications..."
                    }
                    className="max-h-[150px] min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-steel-100 placeholder-steel-500 focus:outline-none dark:text-steel-100"
                    rows={1}
                    disabled={isLoading}
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-400 hover:to-blue-500 hover:shadow-blue-500/40 active:scale-95 disabled:cursor-not-allowed disabled:from-steel-700 disabled:to-steel-700 disabled:text-steel-500 disabled:shadow-none"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Helper Text */}
            <p className="mt-2 text-center text-xs text-steel-500">
              Press{" "}
              <kbd className="rounded bg-steel-800 px-1.5 py-0.5 font-mono text-steel-400">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="rounded bg-steel-800 px-1.5 py-0.5 font-mono text-steel-400">
                Shift + Enter
              </kbd>{" "}
              for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-glow-md">
          <Sparkles className="h-10 w-10 text-blue-400" />
        </div>
        <div className="absolute -inset-2 -z-10 rounded-3xl bg-blue-500/10 blur-xl" />
      </div>

      <h2 className="mb-2 text-2xl font-semibold text-steel-100">
        EMJAC Engineering Assistant
      </h2>
      <p className="mb-8 max-w-md text-center text-steel-400">
        Your AI-powered helper for custom stainless steel fabrication projects.
        Ask about kitchen equipment, specifications, or engineering details.
      </p>

      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {[
          {
            title: "Kitchen Equipment",
            description: "Chef counters, cabinets, dishtables & worktables",
          },
          {
            title: "Doors & Frames",
            description: "Custom stainless steel door solutions",
          },
          {
            title: "Wine Coolers",
            description: "Elegant front-of-house display coolers",
          },
          {
            title: "Engineering Specs",
            description: "Material grades, dimensions & tolerances",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="group cursor-pointer rounded-xl border border-steel-800/50 bg-steel-900/30 p-4 transition-all duration-300 hover:border-blue-500/30 hover:bg-steel-800/50"
          >
            <h3 className="mb-1 font-medium text-steel-200 transition-colors group-hover:text-blue-400">
              {item.title}
            </h3>
            <p className="text-sm text-steel-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex items-start gap-3 animate-slide-up ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20"
            : "bg-steel-800 text-blue-400 shadow-black/20"
        }`}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20"
            : "bg-steel-800/80 text-steel-100 shadow-black/20"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {message.text}
            </span>
          </p>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-steel-100">
            {message.text}
          </p>
        )}

        {/* File Attachments */}
        {message.files && message.files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 border-t border-white/10 pt-2">
            {message.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs"
              >
                <FileText className="h-3 w-3" />
                <span className="max-w-[100px] truncate">{file.name}</span>
              </div>
            ))}
          </div>
        )}

        <span
          className={`mt-2 block text-xs ${
            isUser ? "text-blue-200" : "text-steel-500"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-steel-800 text-blue-400 shadow-lg shadow-black/20">
        <Bot className="h-5 w-5" />
      </div>
      <div className="rounded-2xl bg-steel-800/80 px-5 py-4 shadow-lg shadow-black/20">
        <div className="flex items-center gap-1.5">
          <div className="typing-dot h-2 w-2 rounded-full bg-blue-400" />
          <div className="typing-dot h-2 w-2 rounded-full bg-blue-400" />
          <div className="typing-dot h-2 w-2 rounded-full bg-blue-400" />
        </div>
      </div>
    </div>
  );
}
