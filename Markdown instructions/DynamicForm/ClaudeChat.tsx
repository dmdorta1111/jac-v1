// components/ClaudeChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import DynamicFormRenderer from './DynamicFormRenderer';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  formSpec?: any;
  timestamp: Date;
}

export default function ClaudeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm here to help you quote and configure custom items. What would you like to build today? (e.g., custom cabinet, business sign, furniture, etc.)",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call your API to get Claude's response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const { text, formSpec } = parseFormFromMessage(data.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        formSpec,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setLoading(true);

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
          id: Date.now().toString(),
          role: 'assistant',
          content: `Great! I've generated your quote document. Here's a summary:\n\n${data.content}\n\n✓ Full documentation saved as: ${data.filename}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);

        // Ask if they need anything else
        setTimeout(() => {
          const followUpMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Is there anything else you\'d like to add or modify? Or would you like to start a new quote?',
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
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I had trouble generating your quote. Please try again or let me know if you need to modify any information.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[800px] max-w-5xl mx-auto border rounded-lg shadow-lg bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold">Claude Sales Assistant</h2>
        <p className="text-sm text-gray-600">Get quotes and specifications for custom items</p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content && (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}

                {message.formSpec && (
                  <div className="mt-4">
                    <DynamicFormRenderer
                      formSpec={message.formSpec}
                      onSubmit={handleFormSubmit}
                    />
                  </div>
                )}

                <div className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message... (e.g., 'I need a custom cabinet')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tip: Be specific about what you want to build (e.g., "outdoor business sign" or "kitchen cabinet")
        </p>
      </div>
    </div>
  );
}
