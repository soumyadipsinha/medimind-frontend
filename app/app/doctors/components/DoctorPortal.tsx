"use client";
import React, { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, FileText, User, CalendarDays } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface DoctorPortalProps {
  appointments: any[];
  prescriptionForm: any;
  setPrescriptionForm: React.Dispatch<React.SetStateAction<any>>;
  onSubmitPrescription: (e: React.FormEvent) => void;
}

export default function DoctorPortal({
  appointments,
  prescriptionForm,
  setPrescriptionForm,
  onSubmitPrescription,
}: DoctorPortalProps) {
  const router = useRouter();
  // Calendar states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientLogs, setPatientLogs] = useState<any | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Month navigation
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Generate calendar days for the currentMonth view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding for empty space from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  // Extract distinct patients from Confirmed/Completed appointments assigned to this doctor
  const patientMap = new Map();
  appointments.forEach((apt) => {
    if (apt.patient?._id && apt.patient?.user?.name) {
      patientMap.set(apt.patient._id, {
        id: apt.patient._id,
        name: apt.patient.user.name,
        email: apt.patient.user.email,
        mobileNumber: apt.patient.mobileNumber || "N/A",
        appointmentId: apt._id,
        appointmentDate: apt.date,
        appointmentTimeSlot: apt.timeSlot,
      });
    }
  });
  const patientsList = Array.from(patientMap.values());

  // Fetch patient logs/previous prescriptions when selected
  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientLogs(selectedPatientId);
    } else {
      setPatientLogs(null);
    }
  }, [selectedPatientId]);

  const fetchPatientLogs = async (patientId: string) => {
    setLoadingLogs(true);
    try {
      const response = await api.get(`/patients/${patientId}/logs`);
      setPatientLogs(response.data);
    } catch (err) {
      console.error("Error fetching patient logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Find appointments on the selected date to display as dots or a list
  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);
  const activeAppts = selectedDateAppointments.filter((apt) => apt.status !== "Completed" && apt.status !== "Cancelled");
  const completedAppts = selectedDateAppointments.filter((apt) => apt.status === "Completed");

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Patients List (Col Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Active Consultations Registry */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
              <User className="size-5 text-primary" /> Active Consultations Registry
            </h3>
            <div className="text-xs text-muted-foreground mb-3 font-semibold">
              Showing schedule for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {activeAppts.map((apt) => (
                <div
                  key={apt._id}
                  className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border hover:border-border/80 bg-card transition-all"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-base">{apt.patient?.user?.name || "Patient"}</span>
                    <span className="text-xs text-muted-foreground">{apt.patient?.user?.email}</span>
                    <span className="text-xs text-muted-foreground">Mobile: {apt.patient?.mobileNumber || "N/A"}</span>
                    <span className="text-[11px] text-primary/80 font-semibold mt-1 bg-muted px-2 py-0.5 rounded border border-border/50 w-fit">
                      Time Slot: {apt.timeSlot}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      router.push(`/app/doctors/prescription?appointmentId=${apt._id}`);
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs px-4 py-2.5 rounded-lg font-bold transition-all h-fit"
                  >
                    Write Prescription
                  </button>
                </div>
              ))}
              {activeAppts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No active consultations scheduled on this date.
                </div>
              )}
            </div>
          </div>

          {/* Completed Consultations (Completion Section) */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
              <Plus className="size-5 text-emerald-500" /> Completed Consultations (Completion Section)
            </h3>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              {completedAppts.map((apt) => (
                <div
                  key={apt._id}
                  className="p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-border/60 bg-emerald-50/10 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-base">{apt.patient?.user?.name || "Patient"}</span>
                    <span className="text-xs text-muted-foreground">{apt.patient?.user?.email}</span>
                    <span className="text-xs text-muted-foreground">Mobile: {apt.patient?.mobileNumber || "N/A"}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                        Completed Slot: {apt.timeSlot}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 bg-emerald-100/50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    Consultation Finished
                  </div>
                </div>
              ))}
              {completedAppts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No completed consultations on this date.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Interactive Calendar (Col Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" /> Appointments Calendar
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 border border-border rounded hover:bg-muted text-muted-foreground"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-xs font-bold text-foreground px-2">
                  {currentMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 border border-border rounded hover:bg-muted text-muted-foreground"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Weekdays label header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="size-9" />;
                const isSelected =
                  selectedDate &&
                  day.getDate() === selectedDate.getDate() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getFullYear() === selectedDate.getFullYear();
                const isToday =
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  day.getFullYear() === new Date().getFullYear();

                const appts = getAppointmentsForDate(day);
                const hasAppts = appts.length > 0;

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`size-9 rounded-lg flex flex-col items-center justify-center text-xs font-bold border transition-all relative ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : isToday
                        ? "bg-muted text-foreground border-primary/50"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <span>{day.getDate()}</span>
                    {hasAppts && (
                      <span
                        className={`size-1.5 rounded-full absolute bottom-1 ${
                          isSelected ? "bg-primary-foreground" : "bg-primary"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List of appointments for selected calendar date */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h4 className="font-bold text-sm mb-3 text-foreground border-b border-border/50 pb-2">
              Schedule for {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </h4>
            <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
              {selectedDateAppointments.map((apt) => (
                <div key={apt._id} className="p-3 bg-muted/40 border border-border/60 rounded-xl flex items-center justify-between text-xs gap-3">
                  <div>
                    <span className="font-bold text-foreground block">{apt.patient?.user?.name || "Unassigned"}</span>
                    <span className="text-muted-foreground block text-[11px] mt-0.5">⏱ {apt.timeSlot}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    apt.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
              {selectedDateAppointments.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">
                  No consultation scheduled on this date.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
