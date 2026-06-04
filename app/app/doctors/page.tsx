"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Activity, LogOut, MessageSquare } from "lucide-react";
import DoctorPortal from "./components/DoctorPortal";
import Loader from "@/components/Loader";
import PageWrapper from "@/components/PageWrapper";

import { getAppointments } from "@/services/appointment.services";
import { createPrescription } from "@/services/prescription.services";
import { toast } from "sonner";

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
      toast.success("Prescription generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error generating prescription");
    }
  };

  return (
    <>
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
    </>
  );
}
