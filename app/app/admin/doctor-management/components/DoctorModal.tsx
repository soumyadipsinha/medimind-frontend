"use client";
import React, { useState } from "react";

interface DoctorModalProps {
  doctorForm: {
    id: string;
    name: string;
    email: string;
    password?: string;
    qualification: string;
    specialization: string;
    experience: string;
    registrationNumber: string;
    consultationFee: string;
    scheduleType: "weekly" | "monthly";
    availableDays: string[];
    startTime: string;
    endTime: string;
    maxPatientsPerDay: string;
    bio: string;
    avatarUrl: string;
    department: string;
  };
  setDoctorForm: React.Dispatch<React.SetStateAction<any>>;
  handleDoctorSubmit: (e: React.FormEvent) => void;
  setShowDoctorModal: (show: boolean) => void;
  handleScheduleTypeChange: (type: "weekly" | "monthly") => void;
  handleDayToggle: (day: string) => void;
  weekDays: string[];
  monthlyDays: string[];
  departments: any[];
}

export default function DoctorModal({
  doctorForm,
  setDoctorForm,
  handleDoctorSubmit,
  setShowDoctorModal,
  handleScheduleTypeChange,
  handleDayToggle,
  weekDays,
  monthlyDays,
  departments,
}: DoctorModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "schedule">("details");

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form onSubmit={handleDoctorSubmit} className="bg-card border border-border p-6 rounded-2xl w-full max-w-lg shadow-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-1 border-b border-border pb-3">
          <h3 className="font-bold text-lg text-foreground">
            {doctorForm.id ? "Edit Doctor Profile" : "Register Doctor Account"}
          </h3>
          {/* Custom Tabs */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTab === "details"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
            >
              1. Doctor Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTab === "schedule"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
              }`}
            >
              2. Availability Schedule
            </button>
          </div>
        </div>

        {activeTab === "details" && (
          <div className="flex flex-col gap-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Credentials</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
            </div>
            {!doctorForm.id && (
              <div>
                <label className="text-xs font-bold text-muted-foreground">Password</label>
                <input
                  type="password"
                  required
                  value={doctorForm.password}
                  onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
            )}

            <div className="text-xs font-bold uppercase tracking-wider text-primary mt-2">Professional Info</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Specialization</label>
                <input
                  type="text"
                  required
                  placeholder="Cardiology"
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Select Department</label>
                <select
                  required
                  value={doctorForm.department}
                  onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none mt-0.5"
                >
                  <option value="">Choose department...</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Qualification</label>
                <input
                  type="text"
                  required
                  placeholder="MD, MBBS"
                  value={doctorForm.qualification}
                  onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Exp (Years)</label>
                <input
                  type="number"
                  required
                  value={doctorForm.experience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Reg Number</label>
                <input
                  type="text"
                  required
                  placeholder="MC12345"
                  value={doctorForm.registrationNumber}
                  onChange={(e) => setDoctorForm({ ...doctorForm, registrationNumber: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Consultation Fee ($)</label>
                <input
                  type="number"
                  required
                  value={doctorForm.consultationFee}
                  onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Doctor Bio</label>
              <textarea
                value={doctorForm.bio}
                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                className="w-full bg-muted border border-border p-2.5 rounded-lg text-sm text-foreground outline-none h-16"
              />
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="flex flex-col gap-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Availability Configuration</div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Schedule Type</label>
              <div className="flex gap-4 mt-1.5">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleType"
                    checked={doctorForm.scheduleType === "weekly"}
                    onChange={() => handleScheduleTypeChange("weekly")}
                    className="size-4 border-border text-primary focus:ring-primary"
                  />
                  Weekly Schedule
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleType"
                    checked={doctorForm.scheduleType === "monthly"}
                    onChange={() => handleScheduleTypeChange("monthly")}
                    className="size-4 border-border text-primary focus:ring-primary"
                  />
                  Monthly Schedule
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">
                {doctorForm.scheduleType === "weekly"
                  ? "Select Available Days of the Week"
                  : "Select Available Dates of the Month"}
              </label>

              {doctorForm.scheduleType === "weekly" ? (
                <div className="flex flex-wrap gap-2 mt-1.5 bg-muted border border-border p-3 rounded-lg">
                  {weekDays.map((day) => {
                    const isSelected = doctorForm.availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 mt-1.5 bg-muted border border-border p-3 rounded-lg">
                  {monthlyDays.map((date) => {
                    const isSelected = doctorForm.availableDays.includes(date);
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => handleDayToggle(date)}
                        className={`size-8 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {date}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Start Time</label>
                <input
                  type="text"
                  required
                  value={doctorForm.startTime}
                  onChange={(e) => setDoctorForm({ ...doctorForm, startTime: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">End Time</label>
                <input
                  type="text"
                  required
                  value={doctorForm.endTime}
                  onChange={(e) => setDoctorForm({ ...doctorForm, endTime: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Max Daily Patients</label>
                <input
                  type="number"
                  required
                  value={doctorForm.maxPatientsPerDay}
                  onChange={(e) => setDoctorForm({ ...doctorForm, maxPatientsPerDay: e.target.value })}
                  className="w-full bg-muted border border-border p-2 rounded text-xs text-foreground outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-4 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowDoctorModal(false)}
            className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-bold"
          >
            {doctorForm.id ? "Save Changes" : "Register Doctor"}
          </button>
        </div>
      </form>
    </div>
  );
}
