import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X, AlertCircle } from "lucide-react";

interface Doctor {
  _id: string;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  startTime: string;
  endTime: string;
  scheduleType: string;
  availableDays?: string[];
}

interface BookingSheetProps {
  bookingDoctorId: string;
  doctors: Doctor[];
  appointments: any[];
  user: any;
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingSlot: string;
  setBookingSlot: (slot: string) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  calendarDays: (Date | null)[];
  getDateStatus: (doc: any, dateObj: Date) => { isAvailable: boolean; reason: string; count: number; limit: number };
  isSlotBooked: (docId: string, dateStr: string, slot: string) => boolean;
  generateDoctorSlots: (doc: any) => string[];
  getHypotheticalQueuePosition: (docId: string, dateStr: string, slotStr: string) => { ahead: number; total: number };
  getQueuePosition: (apt: any) => number;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function BookingSheet({
  bookingDoctorId,
  doctors,
  appointments,
  user,
  bookingDate,
  setBookingDate,
  bookingSlot,
  setBookingSlot,
  currentMonth,
  setCurrentMonth,
  calendarDays,
  getDateStatus,
  isSlotBooked,
  generateDoctorSlots,
  getHypotheticalQueuePosition,
  getQueuePosition,
  onSubmit,
  onClose,
}: BookingSheetProps) {
  if (!bookingDoctorId) return null;
  const selectedDoc = doctors.find((d) => d._id === bookingDoctorId);
  if (!selectedDoc) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 transition-opacity duration-300 flex justify-end">
      {/* Backdrop Click Closer */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Sheet Slider Panel */}
      <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl z-50 flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Schedule Consultation</h3>
              <p className="text-xs text-muted-foreground">Confirm your date and slot details below</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted border border-border rounded-lg text-muted-foreground transition-all"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Doctor details banner */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
              {selectedDoc.user?.name ? selectedDoc.user.name[0] : "D"}
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">Dr. {selectedDoc.user?.name}</h4>
              <p className="text-[10px] text-muted-foreground font-semibold">
                {selectedDoc.specialization} • Fee: ${selectedDoc.consultationFee}
              </p>
            </div>
          </div>

          {/* Calendar Selection block */}
          <div className="bg-muted/40 p-4 rounded-xl border border-border flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CalendarDays className="size-4 text-primary" /> Select Date
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-1 border border-border rounded hover:bg-card text-muted-foreground transition-all hover:text-foreground"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="text-[10px] font-bold text-foreground px-1 whitespace-nowrap min-w-[70px] text-center">
                  {currentMonth.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-1 border border-border rounded hover:bg-card text-muted-foreground transition-all hover:text-foreground"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5 justify-items-center">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="size-8" />;

                const status = getDateStatus(selectedDoc, day);
                const isSelected = bookingDate && new Date(bookingDate).toDateString() === day.toDateString();
                const isToday = new Date().toDateString() === day.toDateString();

                let btnClasses =
                  "size-8 rounded-lg flex flex-col items-center justify-center text-xs font-bold border transition-all duration-200 relative ";

                if (isSelected) {
                  btnClasses += "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105";
                } else if (isToday && status.isAvailable) {
                  btnClasses += "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20";
                } else if (status.isAvailable) {
                  btnClasses +=
                    "bg-card text-foreground border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-105 cursor-pointer";
                } else if (status.reason === "limit_hit") {
                  btnClasses += "bg-red-500/5 text-red-500/40 border-red-500/10 cursor-not-allowed opacity-60";
                } else {
                  btnClasses += "bg-muted/10 text-muted-foreground/30 border-transparent cursor-not-allowed opacity-30";
                }

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={!status.isAvailable}
                    title={
                      status.reason === "limit_hit"
                        ? "Fully Booked (Daily Limit Hit)"
                        : status.reason === "absent"
                        ? "Doctor not on duty"
                        : status.reason === "past"
                        ? "Past Date"
                        : `${status.limit - status.count} slots left`
                    }
                    onClick={() => {
                      const offset = day.getTimezoneOffset();
                      const localDate = new Date(day.getTime() - offset * 60 * 1000);
                      setBookingDate(localDate.toISOString().split("T")[0]);
                      setBookingSlot("");
                    }}
                    className={btnClasses}
                  >
                    <span>{day.getDate()}</span>
                    {status.isAvailable && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                    {status.reason === "limit_hit" && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2 pt-2 border-t border-border/50 text-[9px] text-muted-foreground font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-primary" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-card border border-border" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-500/10 border border-amber-500/30" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-red-500/10 border border-red-500/20" />
                <span>Full</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-6">
          {/* Time Slot Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Clock className="size-3 text-primary" /> Select Time Slot
            </label>
            <select
              required
              value={bookingSlot}
              disabled={!bookingDate}
              onChange={(e) => setBookingSlot(e.target.value)}
              className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
            >
              <option value="">Select slot...</option>
              {generateDoctorSlots(selectedDoc)
                .filter((s) => !isSlotBooked(selectedDoc._id, bookingDate, s))
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>

            {/* Live Queue Position Estimation & Warning Alert in Sheet */}
            {bookingDate && bookingSlot && (() => {
              const { ahead } = getHypotheticalQueuePosition(selectedDoc._id, bookingDate, bookingSlot);
              return (
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-[11px] text-primary flex items-start gap-2 mt-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Queue Placement:</p>
                    <p className="text-muted-foreground mt-0.5">
                      {ahead === 0
                        ? "You will be the first patient for the doctor on this day!"
                        : `You will be scheduled after ${ahead} patient${ahead > 1 ? "s" : ""} on this day (Queue Position: ${ahead + 1}).`}
                    </p>
                  </div>
                </div>
              );
            })()}

            {bookingDate && (() => {
              const existingApt = appointments.find((a) => {
                const isMyApt = a.patient?._id === user?.profile?._id || a.patient?.user?._id === user?.id;
                const isSameDoc = (a.doctor?._id || a.doctor) === selectedDoc._id;
                const isSameDate = new Date(a.date).toDateString() === new Date(bookingDate).toDateString();
                return isMyApt && isSameDoc && isSameDate && (a.status === "Pending" || a.status === "Confirmed");
              });

              if (existingApt) {
                const ahead = getQueuePosition(existingApt);
                return (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[11px] text-amber-700 flex items-start gap-2 mt-2">
                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <p className="font-bold text-amber-600">Existing Consultation Alert:</p>
                      <p className="text-muted-foreground mt-0.5">
                        You already have an appointment booked at <span className="font-bold text-foreground">{existingApt.timeSlot}</span> on this day ({ahead === 0 ? "first in queue" : `after ${ahead} patient(s)`}).
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <div className="flex gap-2.5 mt-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2.5 border border-border rounded-xl text-xs text-muted-foreground flex-1 font-bold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!bookingDate || !bookingSlot}
              className="bg-primary text-primary-foreground hover:bg-primary/95 font-bold py-2.5 px-4 rounded-xl text-xs flex-1 transition-all disabled:opacity-50"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
