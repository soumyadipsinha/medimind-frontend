"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import ChatSection from "@/app/components/ChatSection";
import { markChatAsSeen, getChatMessages, getChatUsers } from "@/services/chat.services";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";

export default function PatientChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { socket } = useSocket();

  // Chat state
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "patient")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "patient") {
      fetchChatUsers();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user && user.role === "patient") {
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

  if (loading || !user || user.role !== "patient") {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workspace...</div>;
  }

  return (
    <PageWrapper
      title="Doctor Consultations Chat"
      description="Connect directly with your consulting physicians to discuss reports, prescription dosage, or clinical advice."
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
  );
}
