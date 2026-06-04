"use client";
import React, { useState } from "react";
import { XCircle } from "lucide-react";
import { login as authLogin, register as authRegister } from "@/services/auth.services";
import { toast } from "sonner";

interface AuthModalProps {
  onClose: () => void;
  defaultRole?: "patient" | "doctor" | "admin";
  defaultTab?: "login" | "register";
  onLoginSuccess: (userData: any) => void;
}

export default function AuthModal({ onClose, defaultRole = "patient", defaultTab = "login", onLoginSuccess }: AuthModalProps) {
  const [authTab, setAuthTab] = useState<"login" | "register">(defaultTab);
  const [loginRole, setLoginRole] = useState<"patient" | "doctor" | "admin">(defaultRole);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerForm, setRegisterForm] = useState({
    name: "", email: "", password: "", mobileNumber: "", gender: "Male",
    dateOfBirth: "", age: "", address: "", bloodGroup: "O+", height: "",
    weight: "", allergies: "", existingDiseases: "", emergencyContactName: "",
    emergencyContactRelation: "", emergencyContactPhone: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authLogin({ email: loginEmail, password: loginPassword });
      onLoginSuccess(data.user);
      toast.success("Successfully logged in!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authRegister(registerForm);
      onLoginSuccess(data.user);
      toast.success("Patient registered successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
  };

  const inputClass = "w-full bg-muted/40 border border-border p-2.5 rounded-xl text-xs text-foreground outline-none placeholder:text-xs placeholder:text-muted-foreground/60 transition-all focus:border-primary/50 focus:bg-background hover:bg-muted/60 mt-1 shadow-sm";
  const registerInputClass = "w-full bg-muted/40 border border-border p-2.5 rounded-lg text-xs text-foreground outline-none placeholder:text-[11px] placeholder:text-muted-foreground/60 transition-all focus:border-primary/50 focus:bg-background hover:bg-muted/60 mt-1 shadow-sm";

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border/60 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/10">
          <h3 className="font-bold text-base text-foreground tracking-tight">Clinic Access Gate</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors hover:rotate-90 duration-200">
            <XCircle className="size-5" />
          </button>
        </div>
        
        <div className="flex border-b border-border/50 bg-muted/5">
          <button 
            onClick={() => setAuthTab("login")} 
            className={`flex-1 py-3 text-xs font-semibold transition-all relative ${authTab === "login" ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
          >
            Sign In
            {authTab === "login" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-sm" />}
          </button>
          <button 
            onClick={() => setAuthTab("register")} 
            className={`flex-grow py-3 text-xs font-semibold transition-all relative ${authTab === "register" ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}
          >
            Register (Patient Only)
            {authTab === "register" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-sm" />}
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {authTab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Login Role Scope</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {(["patient", "doctor", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setLoginRole(r)}
                      className={`py-2 rounded-lg text-[11px] font-bold capitalize transition-all border ${
                        loginRole === r ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/30 text-muted-foreground border-border hover:bg-muted hover:border-border/80"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@clinic.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 py-3 rounded-xl font-bold transition-all mt-4 shadow-md hover:shadow-primary/25 hover:-translate-y-px active:translate-y-0 text-xs">
                Login to Dashboard
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest w-max mb-2">1. Personal Profile</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Full Name</label>
                  <input 
                    type="text" required value={registerForm.name} placeholder="John Doe"
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className={registerInputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Email</label>
                  <input 
                    type="email" required value={registerForm.email} placeholder="john@example.com"
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className={registerInputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Password</label>
                  <input 
                    type="password" required value={registerForm.password} placeholder="••••••••"
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className={registerInputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Mobile Phone</label>
                  <input 
                    type="text" required value={registerForm.mobileNumber} placeholder="+1 234 567 890"
                    onChange={(e) => setRegisterForm({ ...registerForm, mobileNumber: e.target.value })}
                    className={registerInputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Gender</label>
                  <select value={registerForm.gender} onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })} className={registerInputClass}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Date of Birth</label>
                  <input type="date" required value={registerForm.dateOfBirth} onChange={(e) => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })} className={registerInputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Age</label>
                  <input type="number" required value={registerForm.age} placeholder="25" onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })} className={registerInputClass} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Home Address</label>
                <input type="text" required value={registerForm.address} placeholder="123 Health Ave, City" onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} className={registerInputClass} />
              </div>

              <div className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full inline-block uppercase tracking-widest w-max mt-2 mb-2">2. Clinical & Emergency Details</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Blood Group</label>
                  <input type="text" placeholder="O+" value={registerForm.bloodGroup} onChange={(e) => setRegisterForm({ ...registerForm, bloodGroup: e.target.value })} className={registerInputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Height (cm)</label>
                  <input type="number" placeholder="175" value={registerForm.height} onChange={(e) => setRegisterForm({ ...registerForm, height: e.target.value })} className={registerInputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Weight (kg)</label>
                  <input type="number" placeholder="70" value={registerForm.weight} onChange={(e) => setRegisterForm({ ...registerForm, weight: e.target.value })} className={registerInputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Allergies</label>
                  <input type="text" placeholder="Dust, peanuts" value={registerForm.allergies} onChange={(e) => setRegisterForm({ ...registerForm, allergies: e.target.value })} className={registerInputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Existing Diseases</label>
                  <input type="text" placeholder="Asthma, Diabetes" value={registerForm.existingDiseases} onChange={(e) => setRegisterForm({ ...registerForm, existingDiseases: e.target.value })} className={registerInputClass} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Emergency Contact</label>
                  <input type="text" required placeholder="Name" value={registerForm.emergencyContactName} onChange={(e) => setRegisterForm({ ...registerForm, emergencyContactName: e.target.value })} className={registerInputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Relation</label>
                  <input type="text" required placeholder="Mother" value={registerForm.emergencyContactRelation} onChange={(e) => setRegisterForm({ ...registerForm, emergencyContactRelation: e.target.value })} className={registerInputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Mobile Phone</label>
                  <input type="text" required placeholder="+1 234..." value={registerForm.emergencyContactPhone} onChange={(e) => setRegisterForm({ ...registerForm, emergencyContactPhone: e.target.value })} className={registerInputClass} />
                </div>
              </div>

              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 py-3 rounded-xl font-bold transition-all mt-4 shadow-md hover:shadow-primary/25 hover:-translate-y-px active:translate-y-0 text-xs">
                Complete Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
