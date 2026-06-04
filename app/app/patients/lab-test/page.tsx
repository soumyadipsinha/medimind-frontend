"use client";
import React, { useState, useEffect } from "react";
import PageWrapper from "@/components/PageWrapper";
import PaymentSimulator from "../components/PaymentSimulator";
import { getReports, bookLabTest } from "@/services/report.services";
import { getClinicServices } from "@/services/clinicService.services";
import { verifyPayment } from "@/services/payment.services";
import { Clock, FileDown, ClipboardCheck } from "lucide-react";

export default function LabTestPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showReportsOnly, setShowReportsOnly] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<any | null>(null);

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
      alert(err.message || "Error booking test");
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
      alert("Payment completed successfully!");
      setPaymentData(null);
      fetchLabData();
    } catch (err: any) {
      alert(err.message || "Payment verification failed");
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
                      <a
                        href={rep.fileUrl}
                        target="_blank"
                        className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-3.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5"
                      >
                        <FileDown className="size-3.5" /> Download Report
                      </a>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((ser) => (
              <div key={ser._id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="font-bold text-base text-foreground leading-snug">{ser.name}</h3>
                    <span className="text-base font-black text-primary">${ser.price}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">
                    {ser.departments && ser.departments.length > 0 ? ser.departments.map((d: any) => d.name).join(", ") : "General"}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{ser.description}</p>
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
    </PageWrapper>
  );
}
