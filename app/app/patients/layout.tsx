"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Activity, Plus, Calendar, LogOut, FileText, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "patient")) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "patient") {
    return <div className="p-8 text-center text-muted-foreground">Loading workspace...</div>;
  }

  const menuItems = [
    { name: "Dashboard", href: "/app/patients", icon: Activity },
    { name: "Book Appointment", href: "/app/patients/appointment", icon: Calendar },
    { name: "Book Lab Test", href: "/app/patients/lab-test", icon: Plus },
    { name: "Prescriptions", href: "/app/patients/prescription", icon: FileText },
    { name: "Live Chat", href: "/app/patients/chat", icon: MessageSquare },
  ];

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Side Menu */}
      <aside className="w-64 border-r border-border bg-card/30 flex flex-col justify-between p-4 hidden md:flex">
        <div className="flex flex-col gap-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Patient workspace
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

      {/* Patient Content Panel */}
      <main className="flex-grow p-6 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
