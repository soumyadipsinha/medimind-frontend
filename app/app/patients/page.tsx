"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAppointments } from "@/services/appointment.services";
import { getPrescriptions } from "@/services/prescription.services";
import { getReports } from "@/services/report.services";
import PageWrapper from "@/components/PageWrapper";
import { downloadPrescriptionPDF, downloadReportPDF } from "@/utils/pdfGenerator";
import { Calendar, FileText, FileDown, Pill } from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.role === "patient") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [apptData, presData, repData] = await Promise.all([
        getAppointments(),
        getPrescriptions(),
        getReports(),
      ]);
      setAppointments(apptData);
      setPrescriptions(presData);
      setReports(repData);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  };

  return (
    <PageWrapper
      title="Patient Dashboard"
      description="Welcome to your patient portal. Access health records, consultations, and lab reports."
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Consultations */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
              <Calendar className="size-5 text-primary" /> Upcoming Consultations
            </h3>
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt._id} className="text-xs border border-border p-3 rounded-xl flex justify-between items-center bg-muted/20">
                  <div>
                    <div className="font-bold text-foreground text-sm">Dr. {apt.doctor?.user?.name}</div>
                    <div className="text-muted-foreground mt-0.5">{new Date(apt.date).toLocaleDateString()} - {apt.timeSlot}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                    apt.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>{apt.status}</span>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">No scheduled consultations found.</div>
              )}
            </div>
          </div>

          {/* Prescriptions Summary */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            {(() => {
              // Calculate current calendar week bounds
              const now = new Date();
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              startOfWeek.setHours(0, 0, 0, 0);

              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              endOfWeek.setHours(23, 59, 59, 999);

              const currentWeekPrescriptions = prescriptions.filter((pres) => {
                const pDate = new Date(pres.createdAt || Date.now());
                return pDate >= startOfWeek && pDate <= endOfWeek;
              });

              if (currentWeekPrescriptions.length > 0) {
                return (
                  <>
                    <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
                      <Pill className="size-5 text-emerald-500 animate-pulse" /> Active Medications (This Week)
                    </h3>
                    <div className="flex flex-col gap-4">
                      {currentWeekPrescriptions.map((pres) => (
                        <div key={pres._id} className="border border-border/80 rounded-xl p-4 bg-muted/15 flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-4 border-b border-border/40 pb-2">
                            <div>
                              <span className="text-xs text-muted-foreground font-semibold">Diagnosis: {pres.diagnosis}</span>
                              <div className="text-xs text-foreground font-bold mt-0.5">Dr. {pres.doctor?.user?.name || "Physician"}</div>
                            </div>
                            <button
                              onClick={(e) => { e.preventDefault(); downloadPrescriptionPDF(pres); }}
                              className="text-[10px] text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded font-bold transition-all"
                            >
                              Print RX
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {pres.medicines && pres.medicines.length > 0 ? (
                              pres.medicines.map((m: any, mIdx: number) => (
                                <div key={mIdx} className="bg-card border border-border/55 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                                  <div className="flex justify-between items-center text-xs font-bold text-foreground">
                                    <span className="flex items-center gap-1.5">💊 {m.name} <span className="text-[10px] text-muted-foreground font-normal">({m.dosage})</span></span>
                                    <span className="text-[10px] bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-full">{m.duration}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
                                    <div>
                                      <span className="font-bold text-foreground">Timing:</span> {m.frequency}
                                    </div>
                                    <div>
                                      <span className="font-bold text-foreground">Instructions:</span> <span className="text-emerald-600 font-semibold">{m.instructions || "As directed"}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No medicines specified in this prescription.</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              }

              return (
                <>
                  <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
                    <FileText className="size-5 text-emerald-500" /> Prescriptions Summary
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {prescriptions.map((pres) => (
                      <div key={pres._id} className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between gap-3">
                        <div className="flex flex-col">
                          <div className="font-bold text-foreground text-sm">Diagnosis: {pres.diagnosis}</div>
                          <div className="text-xs text-muted-foreground mt-1">Prescribed by: Dr. {pres.doctor?.user?.name}</div>
                          {pres.advice && <div className="text-xs text-muted-foreground mt-1 leading-relaxed">Advice: {pres.advice}</div>}
                        </div>
                        <div className="flex justify-end border-t border-border/40 pt-2.5">
                          <button 
                            onClick={(e) => { e.preventDefault(); downloadPrescriptionPDF(pres); }}
                            className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-2.5 py-1.5 rounded font-bold flex items-center gap-1 transition-all"
                          >
                            <FileDown className="size-3.5" /> PDF
                          </button>
                        </div>
                      </div>
                    ))}
                    {prescriptions.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-6">No prescriptions found.</div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Lab Reports Table */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold mb-4 text-foreground">My Laboratory Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3">Test Name</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3">Finished At</th>
                  <th className="pb-3 text-right">Report File</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const completedReps = reports.filter((rep) => rep.isCompleted || rep.resultStatus === "Ready");
                  if (completedReps.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">No completed reports found.</td>
                      </tr>
                    );
                  }
                  return completedReps.map((rep) => (
                    <tr key={rep._id} className="border-b border-border/50">
                      <td className="py-3 font-semibold">{rep.test?.name}</td>
                      <td className="py-3 text-xs text-muted-foreground">{rep.notes || "No notes"}</td>
                      <td className="py-3 text-xs">{rep.completedAt ? new Date(rep.completedAt).toLocaleDateString() : "N/A"}</td>
                      <td className="py-3 text-right">
                          <button onClick={(e) => { e.preventDefault(); downloadReportPDF(rep); }} className="text-primary text-xs font-bold inline-flex items-center gap-1 hover:underline"><FileDown className="size-3.5" /> Download PDF</button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
