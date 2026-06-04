"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Activity, LogOut, MessageSquare, Menu } from "lucide-react";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "doctor") {
    return <Loader />;
  }

  const menuItems = [
    { name: "Schedule", href: "/app/doctors", icon: Activity },
    { name: "Live Chat", href: "/app/doctors/chat", icon: MessageSquare },
  ];

  return (
    <div className="flex-1 flex bg-background min-h-screen font-sans bg-gradient-to-br from-cyan-50/40 via-background to-blue-50/20 dark:from-cyan-950/20 dark:via-background dark:to-blue-950/10">
      {/* Side Menu */}
      <aside className={`border-r border-border/50 bg-gradient-to-b from-card/80 to-cyan-50/30 dark:to-cyan-950/20 backdrop-blur-md flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out shrink-0 shadow-[4px_0_24px_-12px_rgba(6,182,212,0.1)] ${isSidebarOpen ? "w-[240px]" : "w-[68px]"}`}>
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Logo / Brand Area */}
          <div className="h-14 flex items-center px-4 border-b border-border/50 overflow-hidden shrink-0 whitespace-nowrap">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`shrink-0 flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 ${isSidebarOpen ? "mr-3" : "mx-auto"}`}>
              <div className={`flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSidebarOpen ? "-rotate-90" : "rotate-0"}`}>
                <Menu className="size-4" />
              </div>
            </button>
            <div className={`transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
              <Link href="/" className="flex items-center gap-2 font-bold text-primary transition-opacity hover:opacity-80">
                <Activity className="size-4 shrink-0" />
                <span className="tracking-tight">MediMind</span>
              </Link>
            </div>
          </div>

          <div className={`p-4 flex flex-col gap-4 overflow-y-auto flex-1 whitespace-nowrap custom-scrollbar`}>
            <div className={`text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 h-0 hidden"}`}>
              Doctor workspace
            </div>
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!isSidebarOpen ? item.name : undefined}
                    className={`flex items-center gap-3 py-2 rounded-md text-[13px] font-medium transition-colors ${isSidebarOpen ? "px-3" : "justify-center px-0"} ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className={`transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"}`}>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Logout Button in sidebar */}
        <div className="border-t border-border/50 pt-4 p-4 overflow-hidden whitespace-nowrap">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            title={!isSidebarOpen ? "Sign out" : undefined}
            className={`flex w-full items-center gap-3 py-2 rounded-md text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${isSidebarOpen ? "px-3" : "justify-center px-0"}`}
          >
            <LogOut className="size-4 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Content Panel */}
      <main className="flex-grow flex flex-col min-w-0 bg-muted/10">
        <div className="p-6 overflow-y-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
