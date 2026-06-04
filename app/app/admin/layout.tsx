"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import { Activity, LogOut, Sun, Moon, Plus, Settings, Users, UserCheck, LayoutDashboard, Menu, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return <Loader />;
  }

  const menuItems = [
    { name: "Dashboard", href: "/app/admin", icon: LayoutDashboard },
    { name: "Departments", href: "/app/admin/department", icon: Plus },
    { name: "Clinic Services", href: "/app/admin/clinic-service", icon: Settings },
    { name: "Doctors", href: "/app/admin/doctor-management", icon: UserCheck },
    { name: "Patients", href: "/app/admin/patient-management", icon: Users },
  ];

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.href === pathname);
    if (currentItem) return currentItem.name;
    const pathParts = pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart ? lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace("-", " ") : "Dashboard";
  };

  return (
    <div className="flex-1 flex bg-background min-h-screen font-sans">
      {/* Side Menu */}
      <aside className={`border-r border-border/50 bg-card/40 backdrop-blur-sm flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out shrink-0 ${isSidebarOpen ? "w-[240px]" : "w-[68px]"}`}>
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
              Admin Menu
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

        {/* Bottom actions */}
        <div className="p-4 border-t border-border/50 overflow-hidden whitespace-nowrap">
          <div className={`flex items-center gap-3 px-3 py-3 mb-2 rounded-md bg-muted/40 transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 h-0 hidden"}`}>
            <div className="size-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-medium truncate">Administrator</span>
              <span className="text-[11px] text-muted-foreground truncate">System Admin</span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            title={!isSidebarOpen ? "Sign out" : undefined}
            className={`flex w-full items-center gap-3 py-2 rounded-md text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${isSidebarOpen ? "px-3" : "justify-center px-0"}`}
          >
            <LogOut className="size-4 shrink-0" />
            <span className={`transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"}`}>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-muted/10">
        {/* Top Header */}
        <header className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme switcher */}
            <div className="flex items-center gap-1.5 border border-border/50 rounded-full p-1 bg-muted/30">
              {(["gray", "blue", "green"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setTheme({ mode: theme.mode, color: c })}
                  className={`size-3.5 rounded-full transition-all ${
                    c === "gray" ? "bg-slate-500" : c === "blue" ? "bg-blue-500" : "bg-emerald-500"
                  } ring-offset-background ring-offset-1 ring-primary ${theme.color === c ? "ring-2 scale-110" : "hover:scale-110"}`}
                  title={`Switch to ${c} theme`}
                />
              ))}
              <div className="w-px h-3 bg-border/80 mx-1" />
              <button 
                onClick={() => setTheme({ color: theme.color, mode: theme.mode === "dark" ? "light" : "dark" })}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Toggle dark mode"
              >
                {theme.mode === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow p-6 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
