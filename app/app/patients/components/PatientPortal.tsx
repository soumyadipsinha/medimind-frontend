"use client";
import React, { useState } from "react";
import { Calendar, FileText, FileDown, Clock, Search, LayoutGrid, ClipboardCheck, ArrowUpDown, Pill } from "lucide-react";

interface PatientPortalProps {
  activeTab: string;
  appointments: any[];
  prescriptions: any[];
  reports: any[];
  departments: any[];
  doctors: any[];
  services: any[];
  bookingDeptId: string;
  setBookingDeptId: (id: string) => void;
  bookingDoctorId: string;
  setBookingDoctorId: (id: string) => void;
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingSlot: string;
  setBookingSlot: (slot: string) => void;
  onSubmitAppointment: (e: React.FormEvent) => void;
  onBookTest: (testId: string, price: number) => void;
}

export default function PatientPortal({
  activeTab,
  appointments,
  prescriptions,
  reports,
  departments,
  doctors,
  services,
  bookingDeptId,
  setBookingDeptId,
  bookingDoctorId,
  setBookingDoctorId,
  bookingDate,
  setBookingDate,
  bookingSlot,
  setBookingSlot,
  onSubmitAppointment,
  onBookTest,
}: PatientPortalProps) {
  // Appointment selection / booking tab state
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [showReportsOnly, setShowReportsOnly] = useState<boolean>(false);

  // Default to first department if available
  React.useEffect(() => {
    if (departments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(departments[0]._id);
      setBookingDeptId(departments[0]._id);
    }
  }, [departments]);

  // Filter doctors based on selected department tab
  const filteredDoctors = doctors.filter((doc) => {
    return doc.department === selectedDeptId || (doc.departments && doc.departments.includes(selectedDeptId));
  });

  const handleTabChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setBookingDeptId(deptId);
    setBookingDoctorId(""); // Reset selected doctor
  };

  if (activeTab === "dashboard") {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-black text-foreground">My Health Records</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Consultations */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
              <Calendar className="size-5 text-primary" /> Upcoming Consultations
            </h3>
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt._id} className="text-xs border border-border p-3 rounded-xl flex justify-between items-center bg-muted/20">
                  <div>
                    <div className="font-bold text-foreground text-sm">Dr. {apt.doctor?.user?.name}</div>
                    <div className="text-muted-foreground mt-0.5">{new Date(apt.date).toLocaleDateString()} - {apt.timeSlot}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                    apt.status === "Confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>{apt.status}</span>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">No scheduled consultations found.</div>
              )}
            </div>
          </div>

          {/* Prescriptions & Medications Section */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            {(() => {
              // Calculate current calendar week bounds
              const now = new Date();
              const startOfWeek = new Date(now);
              startOfWeek.setDate(now.getDate() - now.getDay());
              startOfWeek.setHours(0, 0, 0, 0);

              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              endOfWeek.setHours(23, 59, 59, 999);

              const currentWeekPrescriptions = prescriptions.filter((pres) => {
                const pDate = new Date(pres.createdAt || Date.now());
                return pDate >= startOfWeek && pDate <= endOfWeek;
              });

              if (currentWeekPrescriptions.length > 0) {
                return (
                  <>
                    <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
                      <Pill className="size-5 text-emerald-500 animate-pulse" /> Active Medications (This Week)
                    </h3>
                    <div className="flex flex-col gap-4">
                      {currentWeekPrescriptions.map((pres) => (
                        <div key={pres._id} className="border border-border/80 rounded-xl p-4 bg-muted/15 flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-4 border-b border-border/40 pb-2">
                            <div>
                              <span className="text-xs text-muted-foreground font-semibold">Diagnosis: {pres.diagnosis}</span>
                              <div className="text-xs text-foreground font-bold mt-0.5">Dr. {pres.doctor?.user?.name || "Physician"}</div>
                            </div>
                            <a
                              href={`/api/prescriptions/print/${pres._id}`}
                              target="_blank"
                              className="text-[10px] text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded font-bold transition-all"
                            >
                              Print RX
                            </a>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {pres.medicines && pres.medicines.length > 0 ? (
                              pres.medicines.map((m: any, mIdx: number) => (
                                <div key={mIdx} className="bg-card border border-border/55 p-3 rounded-lg flex flex-col gap-1.5 shadow-sm">
                                  <div className="flex justify-between items-center text-xs font-bold text-foreground">
                                    <span className="flex items-center gap-1.5">💊 {m.name} <span className="text-[10px] text-muted-foreground font-normal">({m.dosage})</span></span>
                                    <span className="text-[10px] bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-full">{m.duration}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
                                    <div>
                                      <span className="font-bold text-foreground">Timing:</span> {m.frequency}
                                    </div>
                                    <div>
                                      <span className="font-bold text-foreground">Instructions:</span> <span className="text-emerald-600 font-semibold">{m.instructions || "As directed"}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No medicines specified in this prescription.</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              }

              // Fallback to regular prescription list if none in the current week
              return (
                <>
                  <h3 className="font-bold mb-4 text-foreground flex items-center gap-2">
                    <FileText className="size-5 text-emerald-500" /> Prescriptions History
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {prescriptions.map((pres) => (
                      <div key={pres._id} className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between gap-3">
                        <div className="flex flex-col">
                          <div className="font-bold text-foreground text-sm">Diagnosis: {pres.diagnosis}</div>
                          <div className="text-xs text-muted-foreground mt-1">Prescribed by: Dr. {pres.doctor?.user?.name}</div>
                          {pres.advice && <div className="text-xs text-muted-foreground mt-1 leading-relaxed">Advice: {pres.advice}</div>}
                        </div>
                        <div className="flex justify-end border-t border-border/40 pt-2.5">
                          <a
                            href={`/api/prescriptions/print/${pres._id}`}
                            target="_blank"
                            className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                          >
                            <FileDown className="size-3.5" /> Download / Print PDF
                          </a>
                        </div>
                      </div>
                    ))}
                    {prescriptions.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-6">No prescriptions found.</div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Lab Reports Table */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold mb-4 text-foreground">My Laboratory Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3">Test Name</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3">Finished At</th>
                  <th className="pb-3 text-right">Report File</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const completedReps = reports.filter((rep) => rep.isCompleted || rep.resultStatus === "Ready");
                  if (completedReps.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">No completed reports found.</td>
                      </tr>
                    );
                  }
                  return completedReps.map((rep) => (
                    <tr key={rep._id} className="border-b border-border/50">
                      <td className="py-3 font-semibold">{rep.test?.name}</td>
                      <td className="py-3 text-xs text-muted-foreground">{rep.notes || "No notes"}</td>
                      <td className="py-3 text-xs">{rep.completedAt ? new Date(rep.completedAt).toLocaleDateString() : "N/A"}</td>
                      <td className="py-3 text-right">
                        {rep.fileUrl ? (
                          <a href={rep.fileUrl} target="_blank" className="text-primary text-xs font-bold inline-flex items-center gap-1 hover:underline"><FileDown className="size-3.5" /> Download PDF</a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No file</span>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "book-appointment") {
    return (
      <div className="flex flex-col gap-6 w-full">
        <h2 className="text-2xl font-black text-foreground">Schedule Consultation</h2>

        {/* Tab Layout of Department Options */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
          {departments.map((d) => (
            <button
              key={d._id}
              type="button"
              onClick={() => handleTabChange(d._id)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
                selectedDeptId === d._id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Practitioners cards of the selected department tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className={`bg-card border rounded-2xl p-5 flex flex-col justify-between gap-5 transition-all shadow-sm hover:shadow-md ${
                bookingDoctorId === doc._id ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                    {doc.user?.name ? doc.user.name[0] : "D"}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base">Dr. {doc.user?.name}</h4>
                    <span className="text-xs text-muted-foreground font-semibold">{doc.specialization}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1.5 flex flex-col gap-1">
                  <span>🎓 Qualification: {doc.qualification}</span>
                  <span>💼 Experience: {doc.experience} Years</span>
                  <span>💵 Consultation Fee: <span className="font-black text-primary">${doc.consultationFee}</span></span>
                </div>
              </div>

              {/* Booking slot controls inside card */}
              {bookingDoctorId === doc._id ? (
                <form onSubmit={onSubmitAppointment} className="flex flex-col gap-3 border-t border-border pt-4 mt-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Select Date</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Time Slot</label>
                      <select
                        required
                        value={bookingSlot}
                        onChange={(e) => setBookingSlot(e.target.value)}
                        className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none focus:border-primary"
                      >
                        <option value="">Select slot...</option>
                        {["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setBookingDoctorId("")}
                      className="px-3 py-2 border border-border rounded-lg text-xs text-muted-foreground flex-1 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-primary-foreground hover:bg-primary/95 font-bold py-2 px-3.5 rounded-lg text-xs flex-1 transition-all"
                    >
                      Book Slot
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setBookingDoctorId(doc._id)}
                  className="w-full bg-primary/10 text-primary hover:bg-primary/20 text-xs py-2 rounded-lg font-bold transition-all mt-2"
                >
                  Book Appointment
                </button>
              )}
            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-border border-dashed rounded-2xl bg-card">
              No practitioners found under this department.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === "book-test") {
    // Filter services list: if showReportsOnly is true, show only completed reports, else show tests catalog
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-2xl font-black text-foreground">
            {showReportsOnly ? "My Laboratory Reports" : "Laboratory Tests catalog"}
          </h2>
          <button
            type="button"
            onClick={() => setShowReportsOnly(!showReportsOnly)}
            className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all"
          >
            <ClipboardCheck className="size-4" /> {showReportsOnly ? "Show Tests Catalog" : "My Lab Reports"}
          </button>
        </div>

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
                    onClick={() => onBookTest(ser._id, ser.price)}
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
      </div>
    );
  }

  if (activeTab === "prescriptions") {
    return (
      <div className="flex flex-col gap-6 w-full">
        <h2 className="text-2xl font-black text-foreground">My Prescriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prescriptions.map((pres) => (
            <div key={pres._id} className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Diagnosis: {pres.diagnosis}</h3>
                    <span className="text-[10px] text-muted-foreground">{new Date(pres.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex flex-col gap-1 bg-muted/40 p-2.5 rounded-lg border border-border/55">
                  <span>👨‍⚕️ Prescribed by: <strong className="text-foreground">Dr. {pres.doctor?.user?.name}</strong></span>
                  {pres.advice && <span>Advice: <span className="text-foreground">{pres.advice}</span></span>}
                  {pres.followUpDate && <span>📅 Follow Up: <span className="text-primary font-semibold">{new Date(pres.followUpDate).toLocaleDateString()}</span></span>}
                </div>
                {pres.medicines && pres.medicines.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 bg-card p-3 rounded-lg border border-border/50">
                    <span className="font-bold text-foreground text-xs border-b border-border pb-1">Prescribed Medicines:</span>
                    {pres.medicines.map((m: any, idx: number) => (
                      <div key={idx} className="text-xs text-muted-foreground flex justify-between gap-2">
                        <span>💊 {m.name} ({m.dosage})</span>
                        <span>{m.frequency} - {m.duration}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-border/40 pt-3 mt-1 flex justify-end">
                <a
                  href={`/api/prescriptions/print/${pres._id}`}
                  target="_blank"
                  className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                >
                  <FileDown className="size-3.5" /> Download / Print PDF
                </a>
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
    );
  }

  return null;
}
