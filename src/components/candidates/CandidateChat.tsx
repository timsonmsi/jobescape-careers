"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, X, Send, User } from "lucide-react";

interface Message {
  id: string;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface CandidateChatProps {
  candidateId: string;
  candidateName?: string;
  onUnreadCountChange?: (count: number) => void;
}

export function CandidateChat({ candidateId, candidateName = "Candidate", onUnreadCountChange }: CandidateChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      // Mark all as read when opening
      setUnreadCount(0);
    }
  }, [isOpen, candidateId]);

  useEffect(() => {
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [candidateId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // When chat opens, mark all as read after a short delay
    if (isOpen && messages.length > 0) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/messages`);
      if (response.ok) {
        const data = await response.json();
        const unreadMessages = data.filter((m: Message) => !m.read);
        if (unreadMessages.length > 0 && !isOpen) {
          setUnreadCount(unreadMessages.length);
        }
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Mark all messages as read
  const markAllAsRead = async () => {
    try {
      const unreadMessages = messages.filter((m: Message) => !m.read);
      if (unreadMessages.length === 0) return;
      
      await Promise.all(
        unreadMessages.map((msg) =>
          fetch(`/api/messages/${msg.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ read: true }),
          })
        )
      );
      setUnreadCount(0);
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
      fetchMessages();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/candidates/${candidateId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: candidateName,
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all z-40 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-6 h-6 min-w-6 p-0 bg-red-500 text-xs flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-white">Recruiter</div>
                <div className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Recruiters will message you here about your applications</p>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  // Messages from candidate are those NOT sent by "Recruiter"
                  const isFromCandidate = message.senderName !== "Recruiter";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromCandidate ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          isFromCandidate
                            ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-br-md shadow-md shadow-blue-400/30"
                            : "bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md"
                        }`}
                      >
                        {!isFromCandidate && (
                          <div className="text-xs font-medium mb-1 opacity-75">
                            {message.senderName}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            isFromCandidate ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 h-11 rounded-full border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                disabled={sending}
              />
              <Button
                type="submit"
                size="icon"
                className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={sending || !newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
