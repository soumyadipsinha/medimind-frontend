"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter, usePathname } from "next/navigation";
import { Activity, LogOut, Sun, Moon, Plus, Settings, Users, UserCheck } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return <div className="p-8 text-center text-muted-foreground">Loading workspace...</div>;
  }

  const menuItems = [
    { name: "Dashboard", href: "/app/admin", icon: Activity },
    { name: "Departments", href: "/app/admin/department", icon: Plus },
    { name: "Clinic Services", href: "/app/admin/clinic-service", icon: Settings },
    { name: "Doctors", href: "/app/admin/doctor-management", icon: UserCheck },
    { name: "Patients", href: "/app/admin/patient-management", icon: Users },
  ];

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Side Menu */}
      <aside className="w-64 border-r border-border bg-card/30 flex flex-col justify-between p-4 hidden md:flex">
        <div className="flex flex-col gap-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Admin workspace
          </div>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="size-4" /> {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button below in sidebar */}
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

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header for theme switching */}
        <header className="h-14 border-b border-border flex items-center justify-end px-6 bg-card/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 border border-border rounded-lg p-1 bg-card">
              {(["gray", "blue", "green"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setTheme({ mode: theme.mode, color: c })}
                  className={`size-5 rounded-full ${
                    c === "gray" ? "bg-slate-500" : c === "blue" ? "bg-blue-500" : "bg-emerald-500"
                  } ring-offset-2 ring-primary ${theme.color === c ? "ring-2 scale-110" : ""}`}
                />
              ))}
              <div className="w-px h-4 bg-border mx-1" />
              <button 
                onClick={() => setTheme({ color: theme.color, mode: theme.mode === "dark" ? "light" : "dark" })}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                {theme.mode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
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
