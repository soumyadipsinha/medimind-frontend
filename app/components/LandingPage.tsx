"use client";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Activity, ArrowRight, Check, Palette, Sun, Moon, MessageSquare, FileText } from "lucide-react";

interface LandingPageProps {
  onEnterPortal: (role?: "patient" | "doctor" | "admin", isRegister?: boolean) => void;
}

export default function LandingPage({ onEnterPortal }: LandingPageProps) {
  const { theme, setTheme } = useTheme();

  return (
    <main className="flex-grow flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 bg-gradient-to-br from-card/30 via-background to-card/20 border-b border-border">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1 rounded-full font-semibold mb-6">
            <Activity className="size-3.5" /> AI-Powered Healthcare Portal
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            Streamline Your Clinic Management with <span className="text-primary bg-clip-text">MediMind</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            A production-ready SaaS for clinics and doctors. Simplify bookings, digital prescriptions, lab test reports, and real-time doctor-patient communication in one modern dashboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onEnterPortal("patient", true)}
              className="bg-primary text-primary-foreground hover:bg-primary/95 text-base px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
            >
              Register as Patient <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => onEnterPortal("doctor", false)}
              className="bg-card text-foreground border border-border hover:bg-muted text-base px-6 py-3 rounded-xl font-bold transition-all"
            >
              Doctor Login
            </button>
            <button
              onClick={() => onEnterPortal("admin", false)}
              className="text-muted-foreground hover:text-foreground text-sm font-semibold underline"
            >
              Admin Console
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-black text-center mb-16 text-foreground">Why Medical Teams Trust MediMind</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Dynamic Themes & UI", icon: Palette, desc: "A beautiful, premium theme customizer supporting responsive interfaces suited for clinics and patient ease." },
            { title: "Digital Prescription Module", icon: FileText, desc: "Doctors can record diagnosis, schedule dosage frequencies, advise tests, and create printable prescription reports." },
            { title: "Socket.io Patient Chat", icon: MessageSquare, desc: "Direct, secure doctor-patient messaging restricted to patients with confirmed/active clinic appointments." }
          ].map((item, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <item.icon className="size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/40 border-t border-border w-full">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-black text-foreground mb-4">Flexible Pricing for All Sizes</h2>
          <p className="text-muted-foreground">Get started with our flexible plans tailored for individual practitioners and full hospital boards.</p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-4">
          {[
            { name: "Starter Practice", price: "$49/mo", desc: "Best for individual clinics", features: ["1 Doctor account", "Unlimited Patient records", "Digital Prescriptions", "Socket.io Chat support"] },
            { name: "Enterprise Hospital", price: "$199/mo", desc: "Best for medical institutions", features: ["Unlimited Doctors & Staff", "Custom Department CRUD", "Laboratory Reports flow", "Priority SharePoint uploads", "Detailed Analytics reports"] }
          ].map((plan, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.desc}</p>
                <div className="text-4xl font-extrabold text-primary mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onEnterPortal("patient", true)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-xl font-bold transition-all"
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-card/20 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <span className="font-bold text-foreground">MediMind SaaS</span>
          </div>
          <div>© 2026 MediMind Clinic Management. All rights reserved. Built for clinics.</div>
        </div>
      </footer>
    </main>
  );
}
