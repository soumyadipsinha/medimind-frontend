"use client";
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import { downloadPrescriptionPDF } from "@/utils/pdfGenerator";
import { getPrescriptions } from "@/services/prescription.services";
import { FileText, FileDown } from "lucide-react";

export default function PrescriptionListPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageWrapper
      title="My Prescriptions"
      description="View diagnosis histories, professional medical advice, and download issued prescription PDFs."
    >
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((pres) => (
            <div key={pres._id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 h-[300px]">
              <div className="flex flex-col gap-2 overflow-hidden h-full">
                <div className="flex items-center gap-2 mb-1 shrink-0">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-foreground text-sm truncate">Diagnosis: {pres.diagnosis}</h3>
                    <span className="text-[10px] text-muted-foreground block truncate">{new Date(pres.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto scrollbar-thin pr-2 pb-1 flex flex-col gap-2">
                  <div className="text-xs text-muted-foreground flex flex-col gap-1 bg-muted/40 p-2.5 rounded-lg border border-border/55">
                    <span>👨‍⚕️ Prescribed by: <strong className="text-foreground">Dr. {pres.doctor?.user?.name}</strong></span>
                    {pres.advice && <span>Advice: <span className="text-foreground">{pres.advice}</span></span>}
                    {pres.followUpDate && <span>📅 Follow Up: <span className="text-primary font-semibold">{new Date(pres.followUpDate).toLocaleDateString()}</span></span>}
                  </div>
                  {pres.medicines && pres.medicines.length > 0 && (
                    <div className="flex flex-col gap-1.5 bg-card p-3 rounded-lg border border-border/50">
                      <span className="font-bold text-foreground text-xs border-b border-border pb-1">Prescribed Medicines:</span>
                      {pres.medicines.map((m: any, idx: number) => (
                        <div key={idx} className="text-xs text-muted-foreground flex justify-between gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin pb-1">
                          <span>💊 {m.name} ({m.dosage})</span>
                          <span>{m.frequency} - {m.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-border/40 pt-3 mt-1 flex justify-end">
                <button
                  onClick={(e) => { e.preventDefault(); downloadPrescriptionPDF(pres); }}
                  className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                >
                  <FileDown className="size-3.5" /> Download / Print PDF
                </button>
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-border border-dashed rounded-2xl bg-card">
              No prescriptions found in your account history.
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
