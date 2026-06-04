"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PageWrapper from "@/components/PageWrapper";
import api from "@/lib/api";
import { getAppointments, bookAppointment } from "@/services/appointment.services";
import { createPrescription } from "@/services/prescription.services";
import { getClinicServices } from "@/services/clinicService.services";
import { ArrowLeft, Plus, Trash2, Printer, CheckCircle, FileText, Activity, AlertCircle, Heart, User, Clipboard, Calendar } from "lucide-react";

function WritePrescriptionWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const { user } = useAuth();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [patientLogs, setPatientLogs] = useState<any | null>(null);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitals
  const [vitals, setVitals] = useState({
    bp: "120/80",
    pulse: "72",
    temp: "98.6",
    weight: "70",
    spo2: "99"
  });

  // Prescription Form
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    advice: "",
    medicines: [{ name: "", dosage: "", frequency: "1-0-1", duration: "5 days", instructions: "After Food" }],
    recommendedTests: [] as string[],
    followUpDate: ""
  });

  useEffect(() => {
    if (!appointmentId) {
      router.push("/app/doctors");
      return;
    }
    fetchData();
  }, [appointmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all doctor appointments to find the active one
      const appts = await getAppointments();
      const activeAppt = appts.find((a: any) => a._id === appointmentId);
      
      if (!activeAppt) {
        alert("Appointment not found!");
        router.push("/app/doctors");
        return;
      }
      setAppointment(activeAppt);

      // Load clinic test options
      const tests = await getClinicServices();
      setAvailableTests(tests.filter((s: any) => s.type === "Laboratory" || s.type === "Radiology"));

      // Load patient clinical profile logs & logs history
      const logsResponse = await api.get(`/patients/${activeAppt.patient?._id}/logs`);
      setPatientLogs(logsResponse.data);

      // Pre-populate patient vitals weight if available
      if (logsResponse.data?.patient) {
        setVitals((prev) => ({
          ...prev,
          weight: logsResponse.data.patient.weight?.toString() || "70"
        }));
      }
    } catch (err) {
      console.error("Error loading prescription workspace data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineChange = (idx: number, field: string, val: string) => {
    const list = [...prescriptionForm.medicines] as any;
    list[idx][field] = val;
    setPrescriptionForm({ ...prescriptionForm, medicines: list });
  };

  const addMedicineRow = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: [...prescriptionForm.medicines, { name: "", dosage: "", frequency: "1-0-1", duration: "5 days", instructions: "After Food" }]
    });
  };

  const removeMedicineRow = (idx: number) => {
    if (prescriptionForm.medicines.length === 1) return;
    const list = prescriptionForm.medicines.filter((_, i) => i !== idx);
    setPrescriptionForm({ ...prescriptionForm, medicines: list });
  };

  const handleTestToggle = (testId: string) => {
    let updated = [...prescriptionForm.recommendedTests];
    if (updated.includes(testId)) {
      updated = updated.filter((id) => id !== testId);
    } else {
      updated.push(testId);
    }
    setPrescriptionForm({ ...prescriptionForm, recommendedTests: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Append vitals information dynamically to the general Advice block for print reference
      const formattedAdvice = `Vitals Summary - BP: ${vitals.bp} mmHg, Pulse: ${vitals.pulse} bpm, Temp: ${vitals.temp}°F, Weight: ${vitals.weight}kg, SpO2: ${vitals.spo2}%\n\nAdvice:\n${prescriptionForm.advice}`;
      
      await createPrescription({
        appointmentId: appointmentId,
        diagnosis: prescriptionForm.diagnosis,
        advice: formattedAdvice,
        medicines: prescriptionForm.medicines,
        recommendedTests: prescriptionForm.recommendedTests,
        followUpDate: prescriptionForm.followUpDate
      });

      alert("Digital Prescription generated and saved successfully!");
      router.push("/app/doctors");
    } catch (err: any) {
      alert(err.message || "Failed to save prescription. Check fields.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !appointment || !patientLogs) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading patient profile and EMR workspace...</div>;
  }

  const patient = patientLogs.patient;

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      {/* Dynamic Vitals Print Stylesheet injected inline */}
      <style>{`
        @media print {
          nav, aside, header, footer, button, .no-print {
            display: none !important;
          }
          body, main {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Workspace Navbar (no-print) */}
      <header className="no-print border-b border-border bg-card/65 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/app/doctors")}
            className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-foreground">Digital Prescription Workspace</h1>
            <p className="text-[11px] text-muted-foreground">Consultation with {patient?.user?.name || "Patient"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
          >
            <Printer className="size-4" /> Print / Save PDF
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm"
          >
            <CheckCircle className="size-4" /> Save & Close Consultation
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6">
        
        {/* Left Side Workspace Editors (Col Span 7) */}
        <section className="no-print xl:col-span-7 flex flex-col gap-6">
          
          {/* EMR Dashboard Card (Vitals, Demographics, Bio) */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <User className="size-4.5 text-primary" /> Patient Clinical Profile (EMR)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex flex-col bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <span className="text-muted-foreground font-semibold">Name</span>
                <span className="font-bold text-foreground text-sm mt-0.5">{patient?.user?.name}</span>
              </div>
              <div className="flex flex-col bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <span className="text-muted-foreground font-semibold">Age & Gender</span>
                <span className="font-bold text-foreground text-sm mt-0.5">{patient?.age} Yrs / {patient?.gender}</span>
              </div>
              <div className="flex flex-col bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <span className="text-muted-foreground font-semibold">Blood Group</span>
                <span className="font-bold text-primary text-sm mt-0.5">{patient?.bloodGroup}</span>
              </div>
              <div className="flex flex-col bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <span className="text-muted-foreground font-semibold">Allergies</span>
                <span className="font-bold text-red-500 text-sm mt-0.5">{patient?.allergies || "None"}</span>
              </div>
            </div>

            {/* Quick Vitals Recorder */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Heart className="size-3.5 text-red-500" /> Vitals Recorder
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Blood Pressure (mmHg)</label>
                  <input 
                    type="text" 
                    value={vitals.bp} 
                    onChange={(e) => setVitals({...vitals, bp: e.target.value})}
                    className="bg-muted border border-border px-2.5 py-1.5 rounded-lg text-xs font-bold text-foreground focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Pulse Rate (BPM)</label>
                  <input 
                    type="text" 
                    value={vitals.pulse} 
                    onChange={(e) => setVitals({...vitals, pulse: e.target.value})}
                    className="bg-muted border border-border px-2.5 py-1.5 rounded-lg text-xs font-bold text-foreground focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Temperature (°F)</label>
                  <input 
                    type="text" 
                    value={vitals.temp} 
                    onChange={(e) => setVitals({...vitals, temp: e.target.value})}
                    className="bg-muted border border-border px-2.5 py-1.5 rounded-lg text-xs font-bold text-foreground focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">Weight (kg)</label>
                  <input 
                    type="text" 
                    value={vitals.weight} 
                    onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                    className="bg-muted border border-border px-2.5 py-1.5 rounded-lg text-xs font-bold text-foreground focus:border-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">SpO2 Oxygen (%)</label>
                  <input 
                    type="text" 
                    value={vitals.spo2} 
                    onChange={(e) => setVitals({...vitals, spo2: e.target.value})}
                    className="bg-muted border border-border px-2.5 py-1.5 rounded-lg text-xs font-bold text-foreground focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Previous EMR Data & Diagnostics logs (Split sections) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Previous prescriptions panel */}
            <div className="bg-card border border-border rounded-2xl p-5 max-h-80 overflow-y-auto">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border/50 pb-2 mb-3">
                <FileText className="size-4 text-emerald-500" /> Prescriptions History
              </h3>
              <div className="flex flex-col gap-3">
                {patientLogs.prescriptions?.map((p: any) => (
                  <div key={p._id} className="p-3 border border-border bg-muted/20 rounded-xl flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-foreground">Diagnosis: {p.diagnosis}</span>
                      <span className="text-muted-foreground text-[10px]">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    {p.medicines && (
                      <div className="text-muted-foreground flex flex-col gap-0.5 mt-1">
                        {p.medicines.map((m: any, mIdx: number) => (
                          <span key={mIdx} className="text-[10px] font-medium block">
                            💊 {m.name} ({m.dosage}) - {m.frequency} for {m.duration}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {!patientLogs.prescriptions || patientLogs.prescriptions.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-6">No previous prescriptions recorded.</div>
                )}
              </div>
            </div>

            {/* Previous Lab Reports panel */}
            <div className="bg-card border border-border rounded-2xl p-5 max-h-80 overflow-y-auto">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border/50 pb-2 mb-3">
                <Activity className="size-4 text-primary" /> Clinic Lab Investigations
              </h3>
              <div className="flex flex-col gap-3">
                {(() => {
                  const completedReports = patientLogs.reports?.filter((r: any) => r.isCompleted || r.resultStatus === "Ready") || [];
                  if (completedReports.length === 0) {
                    return <div className="text-xs text-muted-foreground text-center py-6">No completed lab reports found.</div>;
                  }
                  return completedReports.map((r: any) => (
                    <div key={r._id} className="p-3 border border-border bg-muted/20 rounded-xl flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-foreground">{r.test?.name}</span>
                        <span className="text-muted-foreground text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[10px]">
                        <span className="text-muted-foreground font-semibold">Result status:</span>
                        <span className="px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">Completed</span>
                      </div>
                      {r.resultValue && (
                        <div className="bg-card p-1.5 border border-border/40 rounded mt-0.5 text-[10px] font-bold text-primary">
                          Result: {r.resultValue}
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* Rx Prescription Builder Form */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <Clipboard className="size-4.5 text-emerald-500" /> Prescribe Treatment & Meds
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Diagnosis</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Acute Tonsillitis / GERD / Migraine" 
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                  className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Dynamic Medicine Input grid */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-muted-foreground">Medicines List</label>
                  <button 
                    type="button" 
                    onClick={addMedicineRow}
                    className="text-xs text-primary font-bold flex items-center gap-1.5"
                  >
                    <Plus className="size-3.5" /> Add Medicine Row
                  </button>
                </div>
                
                <div className="flex flex-col gap-2.5">
                  {prescriptionForm.medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 border-b border-border/40 pb-2.5 sm:border-b-0 sm:pb-0 items-center">
                      <div className="sm:col-span-4">
                        <input 
                          type="text" 
                          required
                          placeholder="Medicine Name & Strength" 
                          value={med.name} 
                          onChange={(e) => handleMedicineChange(idx, "name", e.target.value)}
                          className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input 
                          type="text" 
                          required
                          placeholder="Dosage (e.g. 1 Tab)" 
                          value={med.dosage} 
                          onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                          className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <select 
                          value={med.frequency} 
                          onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)}
                          className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none focus:border-primary"
                        >
                          <option value="1-0-1">1-0-1 (Twice Daily)</option>
                          <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                          <option value="1-0-0">1-0-0 (Morning)</option>
                          <option value="0-0-1">0-0-1 (Night)</option>
                          <option value="Once Daily">Once Daily</option>
                          <option value="PRN / As Needed">PRN (As Needed)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <input 
                          type="text" 
                          required
                          placeholder="Instructions" 
                          value={med.instructions} 
                          onChange={(e) => handleMedicineChange(idx, "instructions", e.target.value)}
                          className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none focus:border-primary"
                        />
                      </div>
                      <div className="sm:col-span-1.5 flex gap-2">
                        <input 
                          type="text" 
                          required
                          placeholder="Duration" 
                          value={med.duration} 
                          onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                          className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none focus:border-primary"
                        />
                        {prescriptionForm.medicines.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeMedicineRow(idx)}
                            className="p-2 border border-border text-destructive hover:bg-destructive/10 rounded"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Investigation Checkboxes */}
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">Recommended Investigations</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-muted/20 border border-border/50 p-3 rounded-xl max-h-44 overflow-y-auto">
                  {availableTests.map((t) => (
                    <label key={t._id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-foreground hover:text-primary transition-all">
                      <input 
                        type="checkbox"
                        checked={prescriptionForm.recommendedTests.includes(t._id)}
                        onChange={() => handleTestToggle(t._id)}
                        className="rounded border-border text-primary focus:ring-primary size-3.5 cursor-pointer"
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* General Advice & Follow-Up */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="text-xs font-bold text-muted-foreground">General Advice & Lifestyle Instructions</label>
                  <textarea 
                    placeholder="e.g. Bed rest for 2 days, avoid spicy meals, drink plenty of water." 
                    value={prescriptionForm.advice}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, advice: e.target.value})}
                    className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-xs text-foreground h-16 outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs font-bold text-muted-foreground">Follow-Up Date</label>
                  <input 
                    type="date" 
                    value={prescriptionForm.followUpDate}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, followUpDate: e.target.value})}
                    className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Professional Live A4 Prescription Pad Preview (Col Span 5) */}
        <section className="print-full-width xl:col-span-5 flex flex-col gap-4">
          <div className="no-print flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Printer className="size-4" /> Live digital prescription A4 Pad Preview
            </span>
          </div>

          {/* Print Pad Template Container */}
          <div 
            id="prescription-pad" 
            className="print-full-width bg-white text-black border border-neutral-300 rounded-2xl shadow-xl p-8 flex flex-col justify-between min-h-[842px] max-w-[595px] mx-auto text-[11px] leading-relaxed font-sans"
          >
            {/* Header section */}
            <div className="flex flex-col">
              <div className="flex justify-between items-start border-b-2 border-primary pb-4 mb-4">
                <div className="flex flex-col">
                  <span className="font-black text-primary text-xl tracking-tight uppercase">Medimind Clinics</span>
                  <span className="text-[10px] text-neutral-500 font-semibold mt-0.5">24/7 Digital Hospital & Specialist Care</span>
                  <span className="text-[9px] text-neutral-500">Contact: support@medimind.org | Tel: +1 800-MED-MIND</span>
                </div>
                
                {/* Doctor details */}
                <div className="flex flex-col text-right">
                  <span className="font-bold text-neutral-800 text-sm">Dr. {appointment?.doctor?.user?.name || user?.name}</span>
                  <span className="text-primary font-bold text-[10px] mt-0.5">{appointment?.doctor?.specialization || "General Medicine Specialist"}</span>
                  <span className="text-neutral-500 text-[9px] font-semibold">Qualification: {appointment?.doctor?.qualification || "MBBS, MD"}</span>
                  <span className="text-neutral-500 text-[9px]">Reg No: {appointment?.doctor?.registrationNumber || "MCI-48592"}</span>
                </div>
              </div>

              {/* Patient demographics bar */}
              <div className="grid grid-cols-4 gap-x-2 gap-y-1.5 bg-neutral-100/80 p-3.5 rounded-xl border border-neutral-200 text-[10px] text-neutral-700 font-semibold mb-6">
                <div>
                  <span className="text-neutral-400 font-bold uppercase tracking-wider block text-[8px]">Patient Name</span>
                  <span className="font-bold text-neutral-900 text-[11px]">{patient?.user?.name || "Patient"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 font-bold uppercase tracking-wider block text-[8px]">Age / Gender</span>
                  <span className="font-bold text-neutral-900">{patient?.age || "N/A"} Yrs / {patient?.gender || "N/A"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 font-bold uppercase tracking-wider block text-[8px]">Blood Group</span>
                  <span className="font-bold text-primary">{patient?.bloodGroup || "N/A"}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 font-bold uppercase tracking-wider block text-[8px] text-right">Consult Date</span>
                  <span className="font-bold text-neutral-900">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>

              {/* Clinical Vitals Section */}
              <div className="flex flex-wrap gap-4 border-b border-neutral-200 pb-3 mb-4 text-[9px] text-neutral-500 font-bold">
                <span>BP: <span className="text-neutral-800 font-black">{vitals.bp} mmHg</span></span>
                <span>PULSE: <span className="text-neutral-800 font-black">{vitals.pulse} BPM</span></span>
                <span>TEMP: <span className="text-neutral-800 font-black">{vitals.temp} °F</span></span>
                <span>WEIGHT: <span className="text-neutral-800 font-black">{vitals.weight} KG</span></span>
                <span>SpO2: <span className="text-neutral-800 font-black">{vitals.spo2} %</span></span>
              </div>

              {/* Diagnosis header */}
              {prescriptionForm.diagnosis && (
                <div className="mb-5">
                  <span className="text-neutral-400 text-[8px] uppercase tracking-wider font-bold block mb-0.5">Primary Diagnosis</span>
                  <span className="font-bold text-neutral-900 text-xs italic">“{prescriptionForm.diagnosis}”</span>
                </div>
              )}

              {/* Rx Medicines pad */}
              <div className="flex flex-col gap-3 min-h-[220px]">
                <span className="font-serif text-2xl font-black italic text-primary leading-none">Rₓ</span>
                
                {/* Medicines table */}
                <table className="w-full text-left border-collapse mt-1">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-400 text-[8px] font-bold uppercase tracking-wider">
                      <th className="pb-1.5 w-[5%]">#</th>
                      <th className="pb-1.5 w-[45%]">Medicine & Strength</th>
                      <th className="pb-1.5 w-[35%]">Dosage / Frequency / Instructions</th>
                      <th className="pb-1.5 w-[15%] text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionForm.medicines.map((med, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 text-neutral-800 font-semibold text-[10px]">
                        <td className="py-2.5 text-neutral-400">{idx + 1}</td>
                        <td className="py-2.5 font-bold text-neutral-900">{med.name || "—"}</td>
                        <td className="py-2.5">{med.dosage ? `${med.dosage} • ` : ""}{med.frequency} • {med.instructions}</td>
                        <td className="py-2.5 text-right font-bold text-neutral-700">{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recommended Investigations block */}
              {prescriptionForm.recommendedTests.length > 0 && (
                <div className="mt-6 border-t border-neutral-100 pt-4">
                  <span className="text-neutral-400 text-[8px] uppercase tracking-wider font-bold block mb-1.5">Investigations Recommended</span>
                  <div className="flex flex-wrap gap-1.5">
                    {prescriptionForm.recommendedTests.map((testId) => {
                      const testName = availableTests.find((t) => t._id === testId)?.name || "Diagnostic Test";
                      return (
                        <span key={testId} className="bg-neutral-100 border border-neutral-200 text-[9px] font-bold text-neutral-700 px-2 py-0.5 rounded">
                          📋 {testName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General Advice section */}
              {prescriptionForm.advice && (
                <div className="mt-5 border-t border-neutral-100 pt-4">
                  <span className="text-neutral-400 text-[8px] uppercase tracking-wider font-bold block mb-1">Advice & Diet Instructions</span>
                  <p className="text-[10px] text-neutral-700 whitespace-pre-line leading-relaxed font-semibold italic">{prescriptionForm.advice}</p>
                </div>
              )}
            </div>

            {/* Signature and footer segment */}
            <div className="flex justify-between items-end border-t border-neutral-200 pt-5 mt-8">
              <div className="flex flex-col text-neutral-500 text-[9px]">
                {prescriptionForm.followUpDate && (
                  <span className="font-bold">📅 Follow-Up Date: <span className="text-primary">{new Date(prescriptionForm.followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></span>
                )}
                <span className="mt-0.5">Please present this prescription during follow-up visits.</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="border border-dashed border-emerald-500/20 bg-emerald-50/40 rounded-lg p-2 text-center text-[7px] text-emerald-600 font-bold uppercase tracking-widest scale-95 opacity-80 flex flex-col items-center mb-1">
                  <span>Digitally Signed</span>
                  <span className="text-[6px] tracking-normal mt-0.5 text-neutral-400">MEDIMIND RX VERIFIED</span>
                </div>
                <div className="w-24 h-0.5 bg-neutral-300 mt-1" />
                <span className="text-neutral-400 text-[8px] mt-1 font-bold uppercase tracking-wider">Doctor Seal / Sig</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function WritePrescriptionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading prescription workspace...</div>}>
      <WritePrescriptionWorkspace />
    </Suspense>
  );
}
