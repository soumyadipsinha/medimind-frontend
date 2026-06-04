"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminPortal from "./components/AdminPortal";

import { getAppointments, updateAppointmentStatus } from "@/services/appointment.services";
import { getReports, uploadReportPDF } from "@/services/report.services";
import { getAdminDashboardMetrics } from "@/services/analytics.services";

import PageWrapper from "@/components/PageWrapper";

export default function AdminPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({ metrics: {}, departmentAnalytics: [] });

  const [reportUploadId, setReportUploadId] = useState<string | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportNotes, setReportNotes] = useState("");

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAppointments();
      fetchReports();
      fetchAdminAnalytics();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminAnalytics = async () => {
    try {
      const data = await getAdminDashboardMetrics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAppointmentStatus = async (id: string, status: string) => {
    try {
      await updateAppointmentStatus(id, status);
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Error updating appointment status");
    }
  };

  const handleReportUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportUploadId || !reportFile) return;
    
    const formData = new FormData();
    formData.append("file", reportFile);
    formData.append("notes", reportNotes);

    try {
      await uploadReportPDF(reportUploadId, formData);
      fetchReports();
      setReportUploadId(null);
      setReportFile(null);
      setReportNotes("");
      alert("Report complete.");
    } catch (err: any) {
      alert(err.message || "Error uploading report");
    }
  };

  return (
    <PageWrapper 
      title="Admin Dashboard" 
      description="Clinic management overview, analytics metrics, and practitioner pending approvals list."
    >
      <div className="flex flex-col gap-6">
        <AdminPortal 
          activeTab="dashboard"
          analytics={analytics}
          appointments={appointments}
          reports={reports}
          departments={[]}
          services={[]}
          doctors={[]}
          patients={[]}
          searchQuery=""
          setSearchQuery={() => {}}
          selectedPatientLog={null}
          onSelectPatientLog={() => {}}
          onAppointmentStatus={handleAppointmentStatus}
          onSetReportUploadId={setReportUploadId}
          onOpenDeptModal={() => {}}
          onDeptDelete={() => {}}
          onOpenServiceModal={() => {}}
          onServiceDelete={() => {}}
          onOpenDoctorModal={() => {}}
          onDoctorDelete={() => {}}
        />

        {/* Report Upload overlay modal */}
        {reportUploadId && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form onSubmit={handleReportUploadSubmit} className="bg-card border border-border p-6 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4">
              <h3 className="font-bold text-lg text-foreground">Upload Finished Lab PDF</h3>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Select PDF / Report Image</label>
                <input 
                  type="file" 
                  required 
                  onChange={(e) => setReportFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-muted border border-border p-2 rounded-lg mt-1 text-xs text-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Lab Technician Notes</label>
                <textarea 
                  placeholder="e.g. CBC counts are normal, thyroid slightly elevated"
                  value={reportNotes} 
                  onChange={(e) => setReportNotes(e.target.value)}
                  className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none h-20"
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setReportUploadId(null)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground">Cancel</button>
                <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-bold">Complete Report</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
