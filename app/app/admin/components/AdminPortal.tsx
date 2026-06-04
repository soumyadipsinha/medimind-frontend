"use client";
import React, { useState } from "react";
import { Users, UserCheck, Calendar, DollarSign, Upload, Plus, Edit3, Trash2, Search, FileDown } from "lucide-react";

interface AdminPortalProps {
  activeTab: string;
  analytics: any;
  appointments: any[];
  reports: any[];
  departments: any[];
  services: any[];
  doctors: any[];
  patients: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPatientLog: any;
  onSelectPatientLog: (id: string) => void;
  onAppointmentStatus: (id: string, status: string) => void;
  onSetReportUploadId: (id: string | null) => void;
  onOpenDeptModal: (dept?: any) => void;
  onDeptDelete: (id: string) => void;
  onOpenServiceModal: (service?: any) => void;
  onServiceDelete: (id: string) => void;
  onOpenDoctorModal: (doctor?: any) => void;
  onDoctorDelete: (id: string) => void;
}

export default function AdminPortal({
  activeTab,
  analytics,
  appointments,
  reports,
  departments,
  services,
  doctors,
  patients,
  searchQuery,
  setSearchQuery,
  selectedPatientLog,
  onSelectPatientLog,
  onAppointmentStatus,
  onSetReportUploadId,
  onOpenDeptModal,
  onDeptDelete,
  onOpenServiceModal,
  onServiceDelete,
  onOpenDoctorModal,
  onDoctorDelete
}: AdminPortalProps) {
  
  if (activeTab === "dashboard") {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-black text-foreground">Admin Command Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Patients", val: analytics.metrics?.totalPatients || 0, icon: Users },
            { label: "Total Doctors", val: analytics.metrics?.totalDoctors || 0, icon: UserCheck },
            { label: "Today's Bookings", val: analytics.metrics?.todaysAppointments || 0, icon: Calendar },
            { label: "Monthly Revenue", val: `$${analytics.metrics?.monthlyRevenue || 0}`, icon: DollarSign },
          ].map((card, i) => (
            <div key={i} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-muted-foreground">{card.label}</div>
                <div className="text-2xl font-black text-foreground mt-1">{card.val}</div>
              </div>
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <card.icon className="size-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Appointment approvals list */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 text-foreground">Pending Appointments Action</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Slot / Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.filter((a) => a.status === "Pending").map((apt) => (
                  <tr key={apt._id} className="border-b border-border/50">
                    <td className="py-3 font-semibold">{apt.patient?.user?.name || "Patient"}</td>
                    <td className="py-3">Dr. {apt.doctor?.user?.name || "Doctor"}</td>
                    <td className="py-3">{new Date(apt.date).toLocaleDateString()} - {apt.timeSlot}</td>
                    <td className="py-3"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span></td>
                    <td className="py-3 text-right flex items-center justify-end gap-2">
                      <button onClick={() => onAppointmentStatus(apt._id, "Confirmed")} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-md font-semibold">Approve</button>
                      <button onClick={() => onAppointmentStatus(apt._id, "Cancelled")} className="bg-destructive/10 text-destructive text-xs px-2.5 py-1 rounded-md font-semibold">Reject</button>
                    </td>
                  </tr>
                ))}
                {appointments.filter((a) => a.status === "Pending").length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">No pending appointments today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lab Test Reports Management */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 text-foreground">Upload Laboratory / Imaging Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Test Name</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Upload Report</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => (
                  <tr key={rep._id} className="border-b border-border/50">
                    <td className="py-3 font-semibold">{rep.patient?.user?.name}</td>
                    <td className="py-3">{rep.test?.name}</td>
                    <td className="py-3">${rep.price}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        rep.isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {rep.isCompleted ? "Completed" : "Pending PDF"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {rep.isCompleted ? (
                        <a href={rep.fileUrl} target="_blank" className="text-primary text-xs font-bold flex items-center justify-end gap-1"><FileDown className="size-3.5" /> Download</a>
                      ) : (
                        <button onClick={() => onSetReportUploadId(rep._id)} className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 ml-auto"><Upload className="size-3" /> Upload PDF</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "departments") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">Department Configuration</h2>
          <button onClick={() => onOpenDeptModal()} className="bg-primary text-primary-foreground hover:bg-primary/95 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5"><Plus className="size-4" /> Add Department</button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground">{dept.name}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${dept.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{dept.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-3">
                <button onClick={() => onOpenDeptModal(dept)} className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1"><Edit3 className="size-3.5" /> Edit</button>
                <button onClick={() => onDeptDelete(dept._id)} className="text-destructive hover:text-destructive/90 text-xs font-semibold flex items-center gap-1 ml-auto"><Trash2 className="size-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "services") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">Clinical Services & Tests</h2>
          <button onClick={() => onOpenServiceModal()} className="bg-primary text-primary-foreground hover:bg-primary/95 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5"><Plus className="size-4" /> Add Test/Service</button>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b border-border text-muted-foreground">
                <th className="p-4">Test Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Price</th>
                <th className="p-4">Delivery Window</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((ser) => (
                <tr key={ser._id} className="border-b border-border/50">
                  <td className="p-4 font-semibold text-foreground">{ser.name}</td>
                  <td className="p-4">{ser.department?.name || "N/A"}</td>
                  <td className="p-4 font-bold text-primary">${ser.price}</td>
                  <td className="p-4">{ser.reportDeliveryTime}</td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => onOpenServiceModal(ser)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit3 className="size-4" /></button>
                    <button onClick={() => onServiceDelete(ser._id)} className="p-1 rounded hover:bg-muted text-destructive"><Trash2 className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeTab === "doctors") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">Clinic Practitioners</h2>
          <button onClick={() => onOpenDoctorModal()} className="bg-primary text-primary-foreground hover:bg-primary/95 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5"><Plus className="size-4" /> Add Doctor</button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div key={doc._id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex gap-4">
              <div className="size-16 rounded-xl bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-xl text-primary border border-border">
                {doc.user?.name ? doc.user.name[0] : "D"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground truncate">{doc.user?.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${doc.user?.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                    {doc.user?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-xs text-primary font-semibold mb-1">{doc.specialization}</div>
                <div className="text-xs text-muted-foreground truncate">{doc.qualification} ({doc.experience} Years Exp)</div>
                <div className="text-xs text-muted-foreground mt-2">Fee: <strong>${doc.consultationFee}</strong> | Slot: {doc.startTime} - {doc.endTime}</div>
                <div className="flex items-center gap-2 border-t border-border/50 pt-2 mt-3">
                  <button onClick={() => onOpenDoctorModal(doc)} className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1"><Edit3 className="size-3.5" /> Edit</button>
                  <button onClick={() => onDoctorDelete(doc._id)} className="text-destructive hover:text-destructive/90 text-xs font-semibold flex items-center gap-1 ml-auto"><Trash2 className="size-3.5" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "patients") {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-black text-foreground">Patient Registry Logs</h2>
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3">
          <Search className="size-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search patients by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm w-full border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col gap-3">
            {patients.filter(p => !searchQuery || p.user?.name.toLowerCase().includes(searchQuery.toLowerCase())).map((pat) => (
              <button 
                key={pat._id} 
                onClick={() => onSelectPatientLog(pat._id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  selectedPatientLog?.patient?._id === pat._id ? "bg-primary/10 border-primary" : "bg-card border-border hover:bg-muted"
                }`}
              >
                <div className="font-bold text-foreground">{pat.user?.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{pat.user?.email}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Mobile: {pat.mobileNumber}</div>
              </button>
            ))}
          </div>

          <div className="md:col-span-2">
            {selectedPatientLog ? (
              <div className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedPatientLog.patient.user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPatientLog.patient.user?.email} | Age: {selectedPatientLog.patient.age} | Blood: {selectedPatientLog.patient.bloodGroup}</p>
                  <div className="text-xs text-muted-foreground mt-2">Allergies: <span className="font-semibold text-destructive">{selectedPatientLog.patient.allergies}</span> | Diseases: <span className="font-semibold">{selectedPatientLog.patient.existingDiseases}</span></div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <h4 className="font-bold mb-3 text-foreground">Appointments History</h4>
                  <div className="space-y-2">
                    {selectedPatientLog.appointments.map((a: any) => (
                      <div key={a._id} className="text-xs p-2.5 rounded-lg border border-border flex justify-between items-center">
                        <div>
                          <strong>Dr. {a.doctor?.user?.name}</strong> ({a.department?.name})
                          <div className="text-muted-foreground mt-0.5">{new Date(a.date).toLocaleDateString()} - {a.timeSlot}</div>
                        </div>
                        <span className="font-semibold">{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-bold mb-3 text-foreground">Prescriptions Logs</h4>
                  <div className="space-y-2">
                    {selectedPatientLog.prescriptions.map((p: any) => (
                      <div key={p._id} className="text-xs p-3 rounded-lg border border-border">
                        <div className="flex justify-between">
                          <strong>Diagnosis: {p.diagnosis}</strong>
                          <a href={`/api/prescriptions/print/${p._id}`} target="_blank" className="text-primary font-bold">Print View</a>
                        </div>
                        <div className="text-muted-foreground mt-1">Advice: {p.advice}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 border border-dashed border-border rounded-2xl flex items-center justify-center text-muted-foreground">Select a patient on the left to inspect complete medical logs</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
