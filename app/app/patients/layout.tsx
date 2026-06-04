"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Activity, Plus, Calendar, LogOut, FileText, Menu } from "lucide-react";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isNavigating, setIsNavigating] = React.useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "patient")) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleNavigate = (e: React.MouseEvent, href: string) => {
    if (pathname === href) return;
    e.preventDefault();
    setIsNavigating(true);
    setTimeout(() => {
      router.push(href);
      setIsNavigating(false);
    }, 1000);
  };

  if (loading || !user || user.role !== "patient" || isNavigating) {
    return <Loader />;
  }

  const menuItems = [
    { name: "Dashboard", href: "/app/patients", icon: Activity },
    { name: "Book Appointment", href: "/app/patients/appointment", icon: Calendar },
    { name: "Book Lab Test", href: "/app/patients/lab-test", icon: Plus },
    { name: "Prescriptions", href: "/app/patients/prescription", icon: FileText },
  ];

  return (
    <div className="flex-1 flex bg-background min-h-screen font-sans">
      {/* Side Menu */}
      <aside className={`border-r border-border/50 bg-card/40 backdrop-blur-sm flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[240px]" : "w-[68px]"}`}>
        <div className="flex flex-col">
          {/* Logo / Brand Area */}
          <div className="h-14 flex items-center px-4 border-b border-border/50 overflow-hidden whitespace-nowrap">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`shrink-0 text-muted-foreground hover:text-foreground transition-colors ${isSidebarOpen ? "mr-3" : "mx-auto"}`}>
              <Menu className="size-4" />
            </button>
            <div className={`transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
              <Link href="/" className="flex items-center gap-2 font-bold text-primary transition-opacity hover:opacity-80">
                <Activity className="size-4 shrink-0" />
                <span className="tracking-tight">MediMind</span>
              </Link>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4 overflow-hidden whitespace-nowrap">
            <div className={`text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2 transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 h-0 hidden"}`}>
              Patient workspace
            </div>
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavigate(e, item.href)}
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

      {/* Patient Content Panel */}
      <main className="flex-grow flex flex-col min-w-0 bg-muted/10">
        <div className="p-6 overflow-y-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
