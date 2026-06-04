"use client";
import React, { useState } from "react";
import { XCircle } from "lucide-react";
import { login as authLogin, register as authRegister } from "@/services/auth.services";

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
      onClose();
    } catch (err: any) {
      alert(err.message || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authRegister(registerForm);
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      alert(err.message || "Registration failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <h3 className="font-bold text-lg text-foreground">Clinic Access Gate</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><XCircle className="size-5" /></button>
        </div>
        
        <div className="flex border-b border-border">
          <button 
            onClick={() => setAuthTab("login")} 
            className={`flex-1 py-3 text-sm font-semibold transition-all ${authTab === "login" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setAuthTab("register")} 
            className={`flex-grow py-3 text-sm font-semibold transition-all ${authTab === "register" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            Register (Patient Only)
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {authTab === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Login Role Scope</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {(["patient", "doctor", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setLoginRole(r)}
                      className={`py-2 rounded-lg text-xs font-bold capitalize transition-all border ${
                        loginRole === r ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:bg-muted/75"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@clinic.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none"
                />
              </div>
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 py-3 rounded-xl font-bold transition-all mt-4">Login to Dashboard</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">1. Personal Profile</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                  <input 
                    type="text" required value={registerForm.name} 
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Email</label>
                  <input 
                    type="email" required value={registerForm.email} 
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Password</label>
                  <input 
                    type="password" required value={registerForm.password} 
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Mobile Phone</label>
                  <input 
                    type="text" required value={registerForm.mobileNumber} 
                    onChange={(e) => setRegisterForm({ ...registerForm, mobileNumber: e.target.value })}
                    className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Gender</label>
                  <select value={registerForm.gender} onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Date of Birth</label>
                  <input type="date" required value={registerForm.dateOfBirth} onChange={(e) => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Age</label>
                  <input type="number" required value={registerForm.age} onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground">Home Address</label>
                <input type="text" required value={registerForm.address} onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
              </div>

              <div className="text-xs font-semibold text-primary uppercase tracking-wider mt-4 mb-2">2. Clinical & Emergency Details</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Blood Group</label>
                  <input type="text" placeholder="O+" value={registerForm.bloodGroup} onChange={(e) => setRegisterForm({ ...registerForm, bloodGroup: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Height (cm)</label>
                  <input type="number" placeholder="175" value={registerForm.height} onChange={(e) => setRegisterForm({ ...registerForm, height: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Weight (kg)</label>
                  <input type="number" placeholder="70" value={registerForm.weight} onChange={(e) => setRegisterForm({ ...registerForm, weight: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Allergies</label>
                  <input type="text" placeholder="Dust, peanuts" value={registerForm.allergies} onChange={(e) => setRegisterForm({ ...registerForm, allergies: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Existing Diseases</label>
                  <input type="text" placeholder="Asthma, Diabetes" value={registerForm.existingDiseases} onChange={(e) => setRegisterForm({ ...registerForm, existingDiseases: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Emergency Contact</label>
                  <input type="text" required placeholder="Name" value={registerForm.emergencyContactName} onChange={(e) => setRegisterForm({ ...registerForm, emergencyContactName: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Relation</label>
                  <input type="text" required placeholder="Mother" value={registerForm.emergencyContactRelation} onChange={(e) => setRegisterForm({ ...registerForm, emergencyContactRelation: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Mobile Phone</label>
                  <input type="text" required placeholder="Phone" value={registerForm.emergencyContactPhone} onChange={(e) => setRegisterForm({ ...registerForm, emergencyContactPhone: e.target.value })} className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground" />
                </div>
              </div>

              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 py-3 rounded-xl font-bold transition-all mt-6">Complete Registration</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
