"use client";
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import { downloadReportPDF } from "@/utils/pdfGenerator";
import PaymentSimulator from "../components/PaymentSimulator";
import { getReports, bookLabTest } from "@/services/report.services";
import { getClinicServices } from "@/services/clinicService.services";
import { verifyPayment } from "@/services/payment.services";
import { Clock, FileDown, ClipboardCheck, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function LabTestPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showReportsOnly, setShowReportsOnly] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<any | null>(null);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [summaryLang, setSummaryLang] = useState<string>("Hindi");
  const [summaryText, setSummaryText] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  useEffect(() => {
    fetchLabData();
  }, []);

  const fetchLabData = async () => {
    try {
      const [reportData, serviceData] = await Promise.all([
        getReports(),
        getClinicServices(),
      ]);
      setReports(reportData);
      setServices(serviceData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookTest = async (testId: string, price: number) => {
    try {
      const data = await bookLabTest(testId);
      setPaymentData({
        amount: price,
        type: "Test",
        referenceId: data.report._id
      });
    } catch (err: any) {
      toast.error(err.message || "Error booking test");
    }
  };

  const handlePaymentConfirm = async () => {
    if (!paymentData) return;
    try {
      await verifyPayment({
        orderId: `order_${Math.random().toString(36).substring(2, 9)}`,
        paymentId: `pay_${Math.random().toString(36).substring(2, 9)}`,
        referenceId: paymentData.referenceId,
        type: paymentData.type,
        amount: paymentData.amount
      });
      toast.success("Payment completed successfully!");
      setPaymentData(null);
      fetchLabData();
    } catch (err: any) {
      toast.error(err.message || "Payment verification failed");
    }
  };

  const fetchSummary = async (reportId: string, lang: string) => {
    try {
      setIsSummarizing(true);
      setSummaryText("");
      const res = await api.post(`/reports/${reportId}/summarize`, {
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
      title="Laboratory Tests & Reports"
      description="Browse available laboratory tests, schedule diagnostics, or download finished reports."
      actions={
        <button
          type="button"
          onClick={() => setShowReportsOnly(!showReportsOnly)}
          className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all"
        >
          <ClipboardCheck className="size-4" /> {showReportsOnly ? "Show Tests Catalog" : "My Lab Reports"}
        </button>
      }
    >
      <div className="flex flex-col gap-6 w-full">
        {showReportsOnly ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const completedReps = reports.filter((rep) => rep.isCompleted || rep.resultStatus === "Ready");
              if (completedReps.length === 0) {
                return (
                  <div className="col-span-full py-12 text-center text-muted-foreground border border-border border-dashed rounded-2xl bg-card">
                    No completed lab reports found.
                  </div>
                );
              }
              return completedReps.map((rep) => (
                <div
                  key={rep._id}
                  className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-foreground text-base leading-snug">{rep.test?.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </div>
                    {rep.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">Notes: {rep.notes}</p>}
                    <span className="text-[10px] text-muted-foreground mt-1.5">
                      Date: {rep.completedAt ? new Date(rep.completedAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  {rep.fileUrl && (
                    <div className="border-t border-border/40 pt-3 mt-1 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedReportId(rep._id);
                          setSummaryLang("Hindi");
                          setShowSummaryModal(true);
                          fetchSummary(rep._id, "Hindi");
                        }}
                        className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all mr-2"
                      >
                        <Sparkles className="size-3.5" /> AI Summary
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); downloadReportPDF(rep); }}
                        className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                      >
                        <FileDown className="size-3.5" /> Download Report
                      </button>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((ser) => (
              <div key={ser._id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 h-[240px]">
                <div className="flex flex-col overflow-hidden h-full">
                  <div className="flex justify-between items-start mb-2 gap-4 shrink-0">
                    <h3 className="font-bold text-base text-foreground leading-snug truncate">{ser.name}</h3>
                    <span className="text-base font-black text-primary shrink-0">${ser.price}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider shrink-0 truncate">
                    {ser.departments && ser.departments.length > 0 ? ser.departments.map((d: any) => d.name).join(", ") : "General"}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed overflow-y-auto scrollbar-thin pr-2 flex-1 pb-1">{ser.description}</p>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3.5" /> Delivery: {ser.reportDeliveryTime}
                  </span>
                  <button
                    onClick={() => handleBookTest(ser._id, ser.price)}
                    className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all"
                  >
                    Book Test
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-border border-dashed rounded-2xl bg-card">
                No laboratory tests catalog configured.
              </div>
            )}
          </div>
        )}

        {/* Payment checkout simulation */}
        <PaymentSimulator 
          paymentData={paymentData}
          onCancel={() => setPaymentData(null)}
          onSubmit={handlePaymentConfirm}
        />
      </div>

      {showSummaryModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-purple-500" />
                <h3 className="font-bold text-base text-foreground">AI Report Scan & Summary</h3>
              </div>
              <button 
                onClick={() => {
                  setShowSummaryModal(false);
                  setSelectedReportId(null);
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
                    if (selectedReportId) {
                      fetchSummary(selectedReportId, newLang);
                    }
                  }}
                  className="bg-muted border border-border p-2.5 rounded-xl text-xs text-foreground outline-none focus:border-primary w-full"
                >
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 bg-muted/30 border border-border/50 p-4 rounded-xl min-h-[180px] justify-center">
                {isSummarizing ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs py-8">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Scanning diagnostic file (PDF/Image) using Vision...</span>
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
                🔬 <strong>Disclaimer:</strong> This is an AI-powered extraction and summary from the original diagnostic sheet. Please verify all key details and reference values with your clinical doctor.
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
