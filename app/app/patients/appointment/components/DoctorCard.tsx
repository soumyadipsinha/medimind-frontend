import React from "react";

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

interface DoctorCardProps {
  doc: Doctor;
  bookingDoctorId: string;
  selectedDeptId: string;
  onBookClick: (docId: string, deptId: string) => void;
}

export default function DoctorCard({
  doc,
  bookingDoctorId,
  selectedDeptId,
  onBookClick,
}: DoctorCardProps) {
  return (
    <div
      className={`bg-card border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-sm hover:shadow-md h-[280px] ${
        bookingDoctorId === doc._id ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-2 overflow-hidden h-full">
        <div className="flex items-center gap-3 shrink-0">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
            {doc.user?.name ? doc.user.name[0] : "D"}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-foreground text-base truncate">Dr. {doc.user?.name}</h4>
            <span className="text-xs text-muted-foreground font-semibold truncate block">{doc.specialization}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-1.5 flex flex-col gap-1.5 overflow-y-auto pr-2 scrollbar-thin flex-1 pb-1">
          <span>🎓 Qualification: {doc.qualification}</span>
          <span>💼 Experience: {doc.experience} Years</span>
          <span>💵 Consultation Fee: <span className="font-black text-primary">${doc.consultationFee}</span></span>
          <span className="text-primary font-bold mt-1 block shrink-0">
            🕒 Work Hours: {doc.startTime} - {doc.endTime}
          </span>
          <span className="text-xs text-muted-foreground italic block overflow-x-auto whitespace-nowrap scrollbar-thin pb-1.5 shrink-0">
            Available: {doc.scheduleType === "weekly" ? "Weekly on " : "Monthly dates "}{doc.availableDays?.join(", ")}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBookClick(doc._id, selectedDeptId)}
        className="w-full bg-primary/10 text-primary hover:bg-primary/20 text-xs py-2.5 rounded-xl font-bold transition-all mt-2 border border-transparent"
      >
        Book Appointment
      </button>
    </div>
  );
}
