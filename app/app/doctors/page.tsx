"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Activity, LogOut } from "lucide-react";
import DoctorPortal from "./components/DoctorPortal";
import Loader from "@/components/Loader";
import PageWrapper from "@/components/PageWrapper";

import { getAppointments } from "@/services/appointment.services";
import { createPrescription } from "@/services/prescription.services";

export default function DoctorsPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptionForm, setPrescriptionForm] = useState({
    appointmentId: "", diagnosis: "", advice: "", 
    medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
    recommendedTests: [] as string[], followUpDate: ""
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "doctor")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchAppointments();
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

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPrescription(prescriptionForm);
      fetchAppointments();
      setPrescriptionForm({
        appointmentId: "", diagnosis: "", advice: "", 
        medicines: [{ name: "", dosage: "", frequency: "", duration: "" }],
        recommendedTests: [], followUpDate: ""
      });
      alert("Prescription generated successfully!");
    } catch (err: any) {
      alert(err.message || "Error generating prescription");
    }
  };

  if (loading || !user || user.role !== "doctor") {
    return <Loader fullScreen={false} />;
  }

  return (
    <div className="flex-1 flex bg-background min-h-screen">
      {/* Side Menu */}
      <aside className="w-64 border-r border-border bg-card/30 flex flex-col justify-between p-4 hidden md:flex">
        <div className="flex flex-col gap-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Doctor workspace
          </div>
          <nav className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground">
              <Activity className="size-4" /> Schedule
            </button>
          </nav>
        </div>

        {/* Logout Button in sidebar */}
        <div className="border-t border-border pt-4">
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Doctor Content Panel */}
      <main className="flex-grow p-6 overflow-y-auto w-full">
        <PageWrapper
          title="Practitioner Dashboard"
          description="Manage patient appointments, diagnostics schedule, and generate medical prescriptions."
        >
          <DoctorPortal 
            appointments={appointments}
            prescriptionForm={prescriptionForm}
            setPrescriptionForm={setPrescriptionForm}
            onSubmitPrescription={handlePrescriptionSubmit}
          />
        </PageWrapper>
      </main>
    </div>
  );
}
