"use client";
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import { downloadPrescriptionPDF } from "@/utils/pdfGenerator";
import { getPrescriptions } from "@/services/prescription.services";
import { FileText, FileDown, Sparkles, Globe } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function PrescriptionListPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [selectedPresId, setSelectedPresId] = useState<string | null>(null);
  const [summaryLang, setSummaryLang] = useState<string>("Hindi");
  const [summaryText, setSummaryText] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

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

  const fetchSummary = async (presId: string, lang: string) => {
    try {
      setIsSummarizing(true);
      setSummaryText("");
      const res = await api.post("/prescriptions/summarize", {
        prescriptionId: presId,
        language: lang
      });
      if (res.data?.warning) {
        toast.warning(res.data.warning);
      }
      setSummaryText(res.data.summary || "No summary returned.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate AI summary.");
    } finally {
      setIsSummarizing(false);
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
                  onClick={() => {
                    setSelectedPresId(pres._id);
                    setSummaryLang("Hindi");
                    setShowSummaryModal(true);
                    fetchSummary(pres._id, "Hindi");
                  }}
                  className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all mr-2"
                >
                  <Sparkles className="size-3.5" /> AI Summary
                </button>
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

      {showSummaryModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-purple-500" />
                <h3 className="font-bold text-base text-foreground">AI Prescription Summary</h3>
              </div>
              <button 
                onClick={() => {
                  setShowSummaryModal(false);
                  setSelectedPresId(null);
                  setSummaryText("");
                }} 
                className="text-muted-foreground hover:text-foreground text-sm font-semibold hover:underline"
              >
                Close
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Globe className="size-3.5" /> Select Summary Language
                </label>
                <select
                  value={summaryLang}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setSummaryLang(newLang);
                    if (selectedPresId) {
                      fetchSummary(selectedPresId, newLang);
                    }
                  }}
                  className="bg-muted border border-border p-2.5 rounded-xl text-xs text-foreground outline-none focus:border-primary w-full"
                >
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 bg-muted/30 border border-border/50 p-4 rounded-xl min-h-[180px] justify-center">
                {isSummarizing ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs py-8">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing & translating EMR details...</span>
                  </div>
                ) : summaryText ? (
                  <div className="text-xs text-foreground whitespace-pre-line leading-relaxed font-medium">
                    {summaryText}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground text-center">No summary generated yet.</span>
                )}
              </div>

              <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-3">
                ⚠️ <strong>Note:</strong> Medicine names (e.g. Paracetamol, Ibuprofen) remain in English characters for dosage safety and medical consistency.
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
