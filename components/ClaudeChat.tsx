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
  PromptInputButton,
  usePromptInputAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { PaperclipIcon } from "lucide-react";
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
import DynamicFormRenderer from "@/components/DynamicFormRenderer";

const suggestions = [
  "SDI",
  "EMJAC",
  "Harmonic",
];

// Parse form specification from Claude's response
const parseFormFromMessage = (content: string): { text: string; formSpec?: any } => {
  // Look for ```json-form blocks
  const formRegex = /```json-form\s*([\s\S]*?)```/;
  const match = content.match(formRegex);

  if (match && match[1]) {
    try {
      const formSpec = JSON.parse(match[1].trim());
      // Remove the form block from the text content
      const text = content.replace(formRegex, '').trim();
      return { text, formSpec };
    } catch (error) {
      console.error('Failed to parse form JSON:', error);
      return { text: content };
    }
  }

  return { text: content };
};

export function ClaudeChat() {
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

  // Handle form submission from DynamicFormRenderer
  const handleFormSubmit = async (formData: Record<string, any>) => {
    setIsLoading(true);

    try {
      // Send form data to generate quote/documentation
      const response = await fetch('/api/generate-project-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData: {
            projectId: `PRJ-${Date.now()}`,
            ...formData,
          },
          action: 'initial_quote',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add success message with link to document
        const successMessage: Message = {
          id: generateId(),
          sender: 'bot',
          text: `Great! I've generated your quote document. Here's a summary:\n\n${data.content}\n\nFull documentation saved as: ${data.filename}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);

        // Ask if they need anything else
        setTimeout(() => {
          const followUpMessage: Message = {
            id: generateId(),
            sender: 'bot',
            text: "Is there anything else you'd like to add or modify? Or would you like to start a new quote?",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, followUpMessage]);
        }, 500);
      } else {
        throw new Error(data.error || 'Failed to generate document');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      const errorMessage: Message = {
        id: generateId(),
        sender: 'bot',
        text: 'Sorry, I had trouble generating your quote. Please try again or let me know if you need to modify any information.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
      // Build message history for context
      const messageHistory = [...messages, userMessage].map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: message.text.trim(),
          messages: messageHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Parse response for form specification
      const { text, formSpec } = parseFormFromMessage(data.response);

      const botMessage: Message = {
        id: generateId(),
        sender: "bot",
        text: text,
        timestamp: new Date(),
        formSpec: formSpec,
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
    <div className="flex h-full w-full relative gap-4 lg:gap-6">
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
            <div className="mx-auto flex max-w-4xl flex-col gap-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onFormSubmit={handleFormSubmit} />
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
        <div className="justify-center w-full shrink-0 border-border backdrop-blur-sm dark:bg-background">
          <div className="mx-auto w-full">
            {/* Input Container with Glow Effect */}
            <div className="relative">
              {/* Subtle Glow Behind */}
              <div
                className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-zinc-500/20 via-zinc-400/20 to-zinc-600/20 blur-xl duration-500 ${
                  isLoading ? "opacity-80" : "opacity-30"
                }`}
              />

              {/* Main Input Container */}
              <PromptInput
                onSubmit={handleSubmit}
                className="relative bg-linear-to-b from-surface to-background p-1.5 shadow-lg transition-all duration-300 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:ring-transparent has-[[data-slot=input-group-control]:focus-visible]:border-zinc-300 dark:bg-card dark:bg-none dark:shadow-xl dark:shadow-black/20 dark:has-[[data-slot=input-group-control]:focus-visible]:ring-0 dark:has-[[data-slot=input-group-control]:focus-visible]:ring-transparent dark:has-[[data-slot=input-group-control]:focus-visible]:border-zinc-700"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                multiple
                globalDrop
              >
                <PromptInputAttachments className="gap-3 p-4">
                  {(attachment) => (
                    <PromptInputAttachment
                      key={attachment.id}
                      data={attachment}
                      className="h-12 px-3 gap-2.5 rounded-lg text-base"
                    />
                  )}
                </PromptInputAttachments>
                <PromptInputTextarea
                  placeholder="Jac is Waiting..."
                  disabled={isLoading}
                />
                <PromptInputFooter>
                  <PromptInputTools>
                    <AttachmentButton />
                  </PromptInputTools>
                  <PromptInputSubmit
                    disabled={isLoading}
                    status={isLoading ? "submitted" : "ready"}
                    className="relative p-1.5 shadow-lg transition-all duration-300"
                  />
                </PromptInputFooter>
              </PromptInput>             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick?: (text: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 sm:px-8">
      <h2 className="mb-3 text-3xl font-bold text-foreground">
        EMJAC Engineering Assistant
      </h2>
      <p className="mb-12 max-w-xl text-center text-base leading-relaxed text-muted-foreground">
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
              className="group cursor-pointer border-border bg-card px-4 py-2.5 shadow-sm transition-all duration-300 hover:border-zinc-400 hover:bg-accent hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:hover:border-zinc-500"
            />
          ))}
        </Suggestions>
      </div>
    </div>
  );
}

function MessageBubble({ message, onFormSubmit }: { message: Message; onFormSubmit?: (data: Record<string, any>) => void }) {
  const isUser = message.sender === "user";
  const role = isUser ? "user" : "assistant";
  const hasReasoning = !isUser && message.reasoning && message.reasoning.length > 0;
  const hasForm = !isUser && message.formSpec;

  const Avatar = (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
        isUser
          ? "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
          : "bg-secondary text-foreground border-transparent shadow-md dark:bg-card dark:text-muted-foreground dark:shadow-black/20"
      }`}
    >
      {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
    </div>
  );

  const messageBody = (
    <>
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
                  active: "text-zinc-700 dark:text-zinc-300",
                  complete: "text-accent-color dark:text-accent-color",
                };
                const statusBgMap = {
                  pending: "bg-muted/50 dark:bg-muted/50",
                  active: "bg-zinc-100/50 dark:bg-zinc-800/50",
                  complete: "bg-accent-color/10 dark:bg-accent-color/10",
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
                              ? "border-accent-color bg-accent-color dark:border-accent-color dark:bg-accent-color"
                              : task.status === "active"
                                ? "border-zinc-600 bg-zinc-100 dark:border-zinc-400 dark:bg-zinc-900"
                                : "border-muted-foreground bg-transparent dark:border-muted-foreground"
                          }`}
                        >
                          {task.status === "complete" && (
                            <span className="text-xs font-bold text-white">✓</span>
                          )}
                          {task.status === "active" && (
                            <span className="h-2 w-2 rounded-full bg-zinc-600 dark:bg-zinc-400" />
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
            <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-zinc-800 dark:text-zinc-100">
              {message.text}
            </p>
          ) : (
            <MessageResponse className="whitespace-pre-wrap text-sm leading-7 text-slate-800 dark:text-foreground">
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

          {/* Dynamic Form */}
          {hasForm && onFormSubmit && (
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <DynamicFormRenderer
                formSpec={message.formSpec}
                onSubmit={onFormSubmit}
              />
            </div>
          )}

          <span
            className={`mt-4 block text-xs ${
              isUser ? "text-zinc-500" : "text-muted-foreground"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
      </>
    );

    return (
      <div className={`flex w-full animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}>
        {isUser ? (
          <div className="flex items-start gap-3">
                  <MessageComponent from={role} className="flex-1 max-w-[95%] items-end text-right">
                    <MessageContent className="w-full rounded-sm border border-zinc-200 bg-white px-6 py-5 text-slate-900 shadow-md group-[.is-user]:rounded-sm group-[.is-user]:border-zinc-200 group-[.is-user]:bg-white group-[.is-user]:text-slate-900 group-[.is-user]:shadow-md dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50">
                {messageBody}
              </MessageContent>
            </MessageComponent>
            <div className="flex flex-col items-end">{Avatar}</div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-start">{Avatar}</div>
            <MessageComponent from={role} className="max-w-[90%] text-left">
              <MessageContent className="rounded-none bg-transparent px-0 py-0 text-foreground shadow-none">
                {messageBody}
              </MessageContent>
            </MessageComponent>
          </div>
        )}
      </div>
    );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-4 animate-fade-in" aria-live="polite" aria-label="Jac is typing">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground shadow-md dark:bg-card dark:text-muted-foreground dark:shadow-lg dark:shadow-black/20">
        <Bot className="h-5 w-5" />
      </div>
      <div className="rounded-2xl bg-card px-6 py-4 shadow-lg dark:shadow-black/20">
        <div className="flex items-center gap-2">
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
          <div className="typing-dot h-2.5 w-2.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
        </div>
      </div>
    </div>
  );
}

function AttachmentButton() {
  const attachments = usePromptInputAttachments();

  return (
    <PromptInputButton
      onClick={() => attachments.openFileDialog()}
      aria-label="Add attachment"
      className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
    >
      <PaperclipIcon className="size-4" />
    </PromptInputButton>
  );
}
