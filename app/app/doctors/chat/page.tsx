"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Activity, LogOut, MessageSquare } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import ChatSection from "@/app/components/ChatSection";
import { markChatAsSeen, getChatMessages, getChatUsers } from "@/services/chat.services";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";

export default function DoctorChatPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { socket } = useSocket();

  // Chat state
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchChatUsers();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user && user.role === "doctor") {
      const handleReceive = (message: any) => {
        setMessages((prev) => [...prev, message]);
        fetchChatUsers();
      };

      const handleSent = (message: any) => {
        setMessages((prev) => [...prev, message]);
        fetchChatUsers();
      };

      const handleError = (err: any) => {
        toast.error(err.message || "Chat error");
      };

      socket.on("receive_message", handleReceive);
      socket.on("message_sent", handleSent);
      socket.on("error", handleError);

      return () => {
        socket.off("receive_message", handleReceive);
        socket.off("message_sent", handleSent);
        socket.off("error", handleError);
      };
    }
  }, [socket, user]);

  const fetchChatUsers = async () => {
    try {
      const data = await getChatUsers();
      setChatUsers(data);
    } catch (err: any) {
      console.error("Error fetching chat users:", err);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    try {
      const data = await getChatMessages(partnerId);
      setMessages(data.messages || []);
      await markChatAsSeen(partnerId);
      fetchChatUsers(); // Reset unread badge count
    } catch (err: any) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatUser || !socket) return;
    socket.emit("send_message", {
      receiverId: activeChatUser._id,
      content: chatInput.trim()
    });
    setChatInput("");
  };

  if (loading || !user || user.role !== "doctor") {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workspace...</div>;
  }

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Side Menu */}
      <aside className="w-64 border-r border-border bg-card/30 flex flex-col justify-between p-4 hidden md:flex">
        <div className="flex flex-col gap-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Doctor workspace
          </div>
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => router.push("/app/doctors")}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted w-full text-left transition-all"
            >
              <Activity className="size-4" /> Schedule
            </button>
            <button 
              onClick={() => router.push("/app/doctors/chat")}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground w-full text-left"
            >
              <MessageSquare className="size-4" /> Live Chat
            </button>
          </nav>
        </div>

        {/* Logout Button in sidebar */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Doctor Content Panel */}
      <main className="flex-grow p-6 overflow-y-auto w-full">
        <PageWrapper
          title="Patient Communications"
          description="Initiate, reply, and monitor live consultations via secure message channels."
        >
          <ChatSection 
            chatUsers={chatUsers}
            activeChatUser={activeChatUser}
            setActiveChatUser={setActiveChatUser}
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendMessage={handleSendMessage}
            onFetchMessages={fetchMessages}
            currentUser={user}
          />
        </PageWrapper>
      </main>
    </div>
  );
}
