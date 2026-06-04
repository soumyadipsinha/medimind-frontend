"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send } from "lucide-react";

interface ChatSectionProps {
  chatUsers: any[];
  activeChatUser: any;
  setActiveChatUser: (user: any) => void;
  messages: any[];
  chatInput: string;
  setChatInput: (input: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onFetchMessages: (partnerId: string) => void;
  currentUser: any;
}

export default function ChatSection({
  chatUsers,
  activeChatUser,
  setActiveChatUser,
  messages,
  chatInput,
  setChatInput,
  onSendMessage,
  onFetchMessages,
  currentUser,
}: ChatSectionProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm h-[600px] flex">
      {/* Users List Sidebar */}
      <div className="w-1/3 border-r border-border bg-muted/20 flex flex-col">
        <div className="p-4 border-b border-border font-bold text-foreground">Conversations</div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1.5">
          {chatUsers.map((u) => (
            <button
              key={u._id}
              onClick={() => { setActiveChatUser(u); onFetchMessages(u._id); }}
              className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${
                activeChatUser?._id === u._id ? "bg-primary/10 border-primary" : "hover:bg-muted"
              }`}
            >
              <div className="size-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
                {u.name ? u.name[0] : "C"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-foreground truncate">{u.name}</div>
                <div className="text-xs text-muted-foreground truncate">{u.lastMessage?.content || "No messages yet"}</div>
              </div>
              {u.unreadCount > 0 && (
                <span className="size-5 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">{u.unreadCount}</span>
              )}
            </button>
          ))}
          {chatUsers.length === 0 && <div className="text-xs text-muted-foreground text-center py-12">No active conversation partners. You can chat once an appointment is active/confirmed.</div>}
        </div>
      </div>

      {/* Active Chat Conversation Pane */}
      <div className="flex-1 flex flex-col justify-between">
        {activeChatUser ? (
          <>
            {/* Active partner bar */}
            <div className="p-4 border-b border-border bg-muted/10 flex items-center gap-3">
              <div className="size-9 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
                {activeChatUser.name[0]}
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">{activeChatUser.name}</div>
                <div className="text-[10px] text-muted-foreground">{activeChatUser.role}</div>
              </div>
            </div>

            {/* Messages scroll content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === currentUser.id ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl max-w-xs text-sm shadow-sm ${
                    m.sender === currentUser.id ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                  }`}>
                    <div>{m.content}</div>
                    <div className="text-[9px] text-right mt-1 opacity-70">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat text input */}
            <form onSubmit={onSendMessage} className="p-4 border-t border-border bg-card flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-muted border border-border p-2.5 rounded-xl text-sm text-foreground outline-none"
              />
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 p-2.5 rounded-xl transition-all"><Send className="size-4" /></button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="size-12 text-muted-foreground/30 mb-3" />
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}
