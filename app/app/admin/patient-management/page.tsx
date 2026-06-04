"use client";
import React, { useState, useEffect } from "react";
import { FileText, Calendar } from "lucide-react";
import { downloadPrescriptionPDF } from "@/utils/pdfGenerator";
import { getPatients, getPatientLogs } from "@/services/patient.services";
import PageWrapper from "@/components/PageWrapper";
import PatientTable from "./components/PatientTable";
import { toast } from "sonner";

export default function PatientManagementPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [selectedPatientLog, setSelectedPatientLog] = useState<any | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPatientLog = async (id: string) => {
    try {
      const data = await getPatientLogs(id);
      setSelectedPatientLog(data);
    } catch (err: any) {
      toast.error(err.message || "Error fetching patient logs");
    }
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and Sort Logic
  const filteredPatients = patients
    .filter((pat) => {
      const patName = pat.user?.name || "";
      const patEmail = pat.user?.email || "";
      return patName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        patEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pat.mobileNumber.includes(searchQuery);
    })
    .sort((a, b) => {
      let valA = sortField === "name" ? (a.user?.name || "") : a[sortField];
      let valB = sortField === "name" ? (b.user?.name || "") : b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  return (
    <PageWrapper
      title="Patient Registry Logs"
      description="Browse registered patients and inspect medical logs/prescriptions."
    >
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Side: Filterable shadcn table of Patients */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Search bar */}
          <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Search patients by name, email, or mobile..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm w-full border-none outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <PatientTable
            currentItems={currentItems}
            toggleSort={toggleSort}
            selectedPatientLog={selectedPatientLog}
            handleSelectPatientLog={handleSelectPatientLog}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>

        {/* Right Side: Inspected Medical Logs details panel */}
        <div className="md:col-span-1">
          {selectedPatientLog ? (
            <div className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-6 shadow-sm sticky top-20">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedPatientLog.patient.user?.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedPatientLog.patient.user?.email}</p>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-muted p-3 rounded-lg border border-border">
                  <div>Age: <span className="font-semibold text-foreground">{selectedPatientLog.patient.age}</span></div>
                  <div>Blood: <span className="font-semibold text-foreground">{selectedPatientLog.patient.bloodGroup || "N/A"}</span></div>
                  <div className="col-span-2 border-t border-border/50 pt-1.5 mt-1.5">
                    <span className="text-destructive font-bold">Allergies:</span> {selectedPatientLog.patient.allergies || "None"}
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold">Conditions:</span> {selectedPatientLog.patient.existingDiseases || "None"}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <h4 className="font-bold mb-3 text-sm text-foreground flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary" /> Appointments History
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedPatientLog.appointments.map((a: any) => (
                    <div key={a._id} className="text-xs p-2.5 rounded-lg border border-border bg-muted/30 flex justify-between items-center">
                      <div>
                        <strong>Dr. {a.doctor?.user?.name}</strong>
                        <div className="text-muted-foreground mt-0.5">{new Date(a.date).toLocaleDateString()} - {a.timeSlot}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>{a.status}</span>
                    </div>
                  ))}
                  {selectedPatientLog.appointments.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">No appointment history.</div>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-bold mb-3 text-sm text-foreground flex items-center gap-1.5">
                  <FileText className="size-4 text-emerald-500" /> Prescriptions Logs
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedPatientLog.prescriptions.map((p: any) => (
                    <div key={p._id} className="text-xs p-3 rounded-lg border border-border bg-muted/30 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <strong className="text-foreground truncate max-w-[150px]">Diagnosis: {p.diagnosis}</strong>
                        <button onClick={(e) => { e.preventDefault(); downloadPrescriptionPDF(p); }} className="text-primary hover:underline font-bold text-[10px]">Print View</button>
                      </div>
                      <div className="text-muted-foreground leading-relaxed text-[11px] truncate">Advice: {p.advice}</div>
                    </div>
                  ))}
                  {selectedPatientLog.prescriptions.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">No prescriptions issued.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 border border-dashed border-border rounded-2xl flex items-center justify-center text-muted-foreground text-center p-6 text-sm">
              Select a patient record on the left to inspect their complete medical logs history
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
