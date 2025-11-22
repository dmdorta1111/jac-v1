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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    <div className="flex h-full w-full relative">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Chat History Sidebar */}
      <div
        className={`${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky left-0 top-0 z-50 h-screen w-72 lg:w-80 flex justify-between overflow-y-auto p-6 shrink-0 flex-col border-r border-steel-800/50 bg-steel-950/50 backdrop-blur-sm transition-transform duration-300 dark:border-steel-800/50 dark:bg-steel-950/50 light:border-steel-200 light:bg-white/95`}
      >
        <>
          {/* New Chat Button */}
          <div className="mb-6 px-2">
              <button
                onClick={startNewChat}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-steel-700/50 bg-gradient-to-br from-steel-900/80 to-steel-800/80 px-5 py-3.5 text-sm font-semibold text-steel-200 shadow-lg transition-all duration-200 hover:border-blue-500/40 hover:from-steel-800/80 hover:to-steel-700/80 hover:text-blue-300 hover:shadow-glow-sm active:scale-95 dark:border-steel-700/50 dark:from-steel-900/80 dark:to-steel-800/80 dark:text-steel-200 light:border-steel-300 light:from-steel-100 light:to-steel-50 light:text-steel-700 light:shadow-light-md light:hover:border-blue-400 light:hover:from-steel-50 light:hover:to-white light:hover:text-blue-600"
              >
                <Plus className="h-5 w-5" />
                New Chat
              </button>
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto px-2 pb-6">
              <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-steel-500 dark:text-steel-500 light:text-steel-600">
                Recent Chats
              </p>
              <div className="space-y-2">
                {chatSessions.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-steel-600 dark:text-steel-600 light:text-steel-500">
                    No chat history yet
                  </p>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => selectSession(session.id)}
                      className={`group flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 ${
                        currentSessionId === session.id
                          ? "bg-gradient-to-r from-blue-600/20 to-blue-500/20 text-blue-400 shadow-md dark:from-blue-600/20 dark:to-blue-500/20 dark:text-blue-400 light:from-blue-100 light:to-blue-50 light:text-blue-600 light:shadow-light-sm"
                          : "text-steel-400 hover:bg-steel-800/60 hover:text-steel-200 dark:text-steel-400 dark:hover:bg-steel-800/60 dark:hover:text-steel-200 light:text-steel-600 light:hover:bg-steel-100 light:hover:text-steel-800"
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 truncate text-sm font-medium">{session.title}</span>
                      <button
                        onClick={(e) => deleteSession(session.id, e)}
                        className="hidden rounded-lg p-1.5 text-steel-500 opacity-0 transition-all hover:bg-steel-700 hover:text-red-400 group-hover:opacity-100 dark:hover:bg-steel-700 dark:hover:text-red-400 light:hover:bg-red-50 light:hover:text-red-500 lg:block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
        </>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3 border-b border-steel-800/30 bg-surface-dark/50 px-6 py-3 backdrop-blur-sm dark:border-steel-800/30 dark:bg-surface-dark/50 light:border-steel-200 light:bg-white/80 lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-steel-800/50 px-4 py-2 text-sm font-medium text-steel-300 shadow-md transition-all hover:bg-steel-700/50 hover:text-blue-400 active:scale-95 dark:bg-steel-800/50 dark:text-steel-300 light:bg-steel-100 light:text-steel-700 light:shadow-light-sm light:hover:bg-steel-200"
          >
            <MessageSquare className="h-4 w-4" />
            Chats
          </button>
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 rounded-lg bg-steel-800/50 px-4 py-2 text-sm font-medium text-steel-300 shadow-md transition-all hover:bg-steel-700/50 hover:text-blue-400 active:scale-95 dark:bg-steel-800/50 dark:text-steel-300 light:bg-steel-100 light:text-steel-700 light:shadow-light-sm light:hover:bg-steel-200"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
          {messages.length === 0 ? (
            <WelcomeScreen />
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
          <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-lg bg-red-500/10 px-6 py-3 text-sm text-red-400 shadow-md dark:bg-red-500/10 dark:text-red-400 light:bg-red-50 light:text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Area */}
        <div
          className="border-t border-steel-800/30 bg-surface-dark/50 px-6 py-6 backdrop-blur-sm dark:border-steel-800/30 dark:bg-surface-dark/50 light:border-steel-200 light:bg-white/80 sm:px-8"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto max-w-4xl">
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2.5">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2.5 rounded-xl bg-steel-800/60 px-4 py-2.5 text-sm shadow-md transition-all hover:bg-steel-800/80 dark:bg-steel-800/60 light:bg-steel-100 light:shadow-light-sm light:hover:bg-steel-200"
                  >
                    <FileText className="h-4 w-4 text-blue-400 dark:text-blue-400 light:text-blue-600" />
                    <span className="max-w-[150px] truncate text-steel-300 dark:text-steel-300 light:text-steel-700">{file.name}</span>
                    <span className="text-xs text-steel-500 dark:text-steel-500 light:text-steel-600">({formatFileSize(file.size)})</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="ml-1 rounded-lg p-1 text-steel-500 transition-all hover:bg-steel-700 hover:text-red-400 dark:hover:bg-steel-700 dark:hover:text-red-400 light:hover:bg-red-50 light:hover:text-red-500"
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
                className={`relative rounded-2xl bg-gradient-to-b from-steel-800/90 to-steel-900/90 p-1.5 shadow-xl shadow-black/20 transition-all duration-300 dark:from-steel-800/90 dark:to-steel-900/90 light:from-steel-100 light:to-steel-50 light:shadow-light-lg ${
                  isDragging ? "ring-2 ring-blue-500/50" : ""
                }`}
              >
                <div className="flex items-end gap-3 rounded-xl bg-gradient-to-b from-steel-800/50 to-steel-850/50 p-3 dark:from-steel-800/50 dark:to-steel-900/80 light:from-white light:to-steel-50/50">
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
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-steel-400 transition-all duration-200 hover:bg-steel-700/50 hover:text-blue-400 active:scale-95 dark:text-steel-400 dark:hover:bg-steel-700/50 dark:hover:text-blue-400 light:text-steel-600 light:hover:bg-steel-200 light:hover:text-blue-600"
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
                    className="max-h-[150px] min-h-[48px] flex-1 resize-none bg-transparent py-3 text-steel-100 placeholder-steel-500 focus:outline-none dark:text-steel-100 light:text-steel-800 light:placeholder-steel-400"
                    rows={1}
                    disabled={isLoading}
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-400 hover:to-blue-500 hover:shadow-blue-500/40 active:scale-95 disabled:cursor-not-allowed disabled:from-steel-700 disabled:to-steel-700 disabled:text-steel-500 disabled:shadow-none dark:from-blue-500 dark:to-blue-600 light:from-blue-500 light:to-blue-600"
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
            <p className="mt-3 text-center text-xs text-steel-500 dark:text-steel-500 light:text-steel-600">
              Press{" "}
              <kbd className="rounded bg-steel-800 px-2 py-1 font-mono text-steel-400 shadow-sm dark:bg-steel-800 dark:text-steel-400 light:bg-steel-200 light:text-steel-700">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="rounded bg-steel-800 px-2 py-1 font-mono text-steel-400 shadow-sm dark:bg-steel-800 dark:text-steel-400 light:bg-steel-200 light:text-steel-700">
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
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 sm:px-8">
      <div className="relative mb-8 animate-fade-in">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 shadow-glow-md dark:from-blue-500/20 dark:to-blue-600/20 light:from-blue-100 light:to-blue-200 light:shadow-light-lg">
          <Sparkles className="h-12 w-12 text-blue-400 animate-pulse dark:text-blue-400 light:text-blue-600" />
        </div>
        <div className="absolute -inset-3 -z-10 rounded-3xl bg-blue-500/10 blur-xl animate-pulse dark:bg-blue-500/10 light:bg-blue-300/20" />
      </div>

      <h2 className="mb-3 text-3xl font-bold text-steel-100 dark:text-steel-100 light:text-steel-800">
        EMJAC Engineering Assistant
      </h2>
      <p className="mb-12 max-w-xl text-center text-base leading-relaxed text-steel-400 dark:text-steel-400 light:text-steel-600">
        Your AI-powered helper for custom stainless steel fabrication projects.
        Ask about kitchen equipment, specifications, or engineering details.
      </p>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
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
            className="group cursor-pointer rounded-2xl border border-steel-800/50 bg-steel-900/40 p-6 shadow-lg transition-all duration-300 hover:border-blue-500/40 hover:bg-steel-800/60 hover:shadow-glow-sm dark:border-steel-800/50 dark:bg-steel-900/40 light:border-steel-200 light:bg-white light:shadow-light-md light:hover:border-blue-400 light:hover:bg-blue-50/50 light:hover:shadow-light-lg"
          >
            <h3 className="mb-2 text-base font-semibold text-steel-200 transition-colors group-hover:text-blue-400 dark:text-steel-200 dark:group-hover:text-blue-400 light:text-steel-800 light:group-hover:text-blue-600">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-steel-500 dark:text-steel-500 light:text-steel-600">{item.description}</p>
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
      className={`flex items-start gap-4 animate-slide-up ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20 dark:from-blue-500 dark:to-blue-600 light:from-blue-500 light:to-blue-600 light:shadow-light-md"
            : "bg-steel-800 text-blue-400 shadow-black/20 dark:bg-steel-800 dark:text-blue-400 light:bg-steel-200 light:text-blue-600 light:shadow-light-md"
        }`}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message Content */}
      <div
        className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20 dark:from-blue-500 dark:to-blue-600 light:from-blue-500 light:to-blue-600 light:shadow-light-lg"
            : "bg-steel-800/80 text-steel-100 shadow-black/20 dark:bg-steel-800/80 dark:text-steel-100 light:bg-steel-100 light:text-steel-800 light:shadow-light-lg"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent dark:from-white dark:via-blue-100 dark:to-white light:from-white light:via-white light:to-white">
              {message.text}
            </span>
          </p>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-steel-100 dark:text-steel-100 light:text-steel-800">
            {message.text}
          </p>
        )}

        {/* File Attachments */}
        {message.files && message.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3 dark:border-white/10 light:border-steel-300">
            {message.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs dark:bg-white/10 light:bg-white/50"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="max-w-[120px] truncate">{file.name}</span>
              </div>
            ))}
          </div>
        )}

        <span
          className={`mt-3 block text-xs ${
            isUser ? "text-blue-200 dark:text-blue-200 light:text-blue-100" : "text-steel-500 dark:text-steel-500 light:text-steel-600"
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
    <div className="flex items-start gap-4 animate-fade-in">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel-800 text-blue-400 shadow-lg shadow-black/20 dark:bg-steel-800 dark:text-blue-400 light:bg-steel-200 light:text-blue-600 light:shadow-light-md">
        <Bot className="h-5 w-5" />
      </div>
      <div className="rounded-2xl bg-steel-800/80 px-6 py-4 shadow-lg shadow-black/20 dark:bg-steel-800/80 light:bg-steel-100 light:shadow-light-lg">
        <div className="flex items-center gap-2">
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-blue-400 dark:bg-blue-400 light:bg-blue-600" />
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-blue-400 dark:bg-blue-400 light:bg-blue-600" />
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-blue-400 dark:bg-blue-400 light:bg-blue-600" />
        </div>
      </div>
    </div>
  );
}
