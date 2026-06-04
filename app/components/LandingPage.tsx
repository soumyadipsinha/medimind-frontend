"use client";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, ArrowRight, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingPageProps {
  onEnterPortal: (role?: "patient" | "doctor" | "admin", isRegister?: boolean) => void;
}

export default function LandingPage({ onEnterPortal }: LandingPageProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <main className="flex-grow flex flex-col h-screen overflow-hidden">
      <section className="relative flex h-full flex-grow w-full overflow-hidden bg-background antialiased flex-col">
        
        {/* Theme-aware grid background with a mask to hide the center and show sides/corners */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 [background-size:40px_40px] [background-position:0px_-1px] select-none [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_70%)]",
            theme.mode === "dark" 
              ? "[background-image:linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)]"
              : "[background-image:linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.15)_1px,transparent_1px)]"
          )}
        />

        {/* Unified Navbar */}
        <header className="relative z-40 w-full bg-transparent pt-4">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer transition-all hover:opacity-80">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Activity className="size-5 text-primary" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground bg-clip-text">MediMind</span>
            </div>

            <div className="flex items-center gap-4">
              {!user && (
                <button
                  onClick={() => onEnterPortal("patient", false)}
                  className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-sm transition-all hover:scale-105 hover:shadow-primary/30 text-xs"
                >
                  <span className="mr-1">Enter Portal</span>
                  <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                    <div className="relative h-full w-4 bg-white/20" />
                  </div>
                </button>
              )}

              {/* Theme switcher */}
              <div className="flex items-center gap-1.5 border border-border/50 rounded-full p-1 bg-muted/30 backdrop-blur-md">
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
          </div>
        </header>

        <div className="relative z-10 mx-auto w-full flex-grow max-w-7xl p-4 flex flex-col items-center justify-center -mt-16">
          
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1 rounded-full font-semibold mb-6">
            <Activity className="size-3.5" /> AI-Powered Healthcare Portal
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight text-center">
            Streamline Your Clinic <br /> Management with <span className="text-primary bg-clip-text">MediMind</span>
          </h1>
          
          {/* Restored the previous text, now fully theme-aware */}
          <p className="text-base md:text-sm text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-center">
            A production-ready SaaS for clinics and doctors. Simplify bookings, digital prescriptions, lab test reports, and real-time doctor-patient communication in one modern dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              onClick={() => onEnterPortal("patient", true)}
              className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-md transition-all hover:scale-105 hover:shadow-lg text-xs tracking-wide"
            >
              <span className="mr-2">Register as Patient</span>
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => onEnterPortal("doctor", false)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-transparent px-8 font-semibold text-foreground transition-all hover:bg-muted hover:text-foreground text-xs tracking-wide"
            >
              Doctor Login
            </button>
            
            <button
              onClick={() => onEnterPortal("admin", false)}
              className="inline-flex h-10 items-center justify-center rounded-full px-6 font-medium text-muted-foreground transition-all hover:text-foreground text-xs"
            >
              Admin Console
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}
