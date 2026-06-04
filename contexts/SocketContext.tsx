"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, loading } = useAuth();
  const isAuthenticated = !loading && user !== null;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    let socketInstance: Socket | null = null;

    if (isAuthenticated && user) {
      const rawUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const baseUrl = rawUrl
        ? rawUrl.replace(/\/api$/, "")
        : typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:8000";

      socketInstance = io(baseUrl, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log("Connected to live server");
        toast.success("Connected to live server", {
          duration: 1000,
        });

        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        console.log("Disconnected from live server");
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      socketInstance.on("ping", (data) => {
        toast.success(data.message, {
          description: data.title,
        });
      });

      socketInstance.on("notification", (data) => {
        // Play notification sound
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => console.error("Error playing sound:", err));

        toast(
          <div className="flex w-full items-start gap-2">
            <div className="mt-1">
              <BellRing
                size={16}
                className="animate-bell"
                color="var(--primary)"
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold">{data.title}</h1>
              <p className="text-xs text-muted-foreground">{data.message}</p>
            </div>
          </div>,
          {
            duration: 4000,
          },
        );
      });

      setSocket(socketInstance);
    } else {
      // Reset state if not authenticated
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
