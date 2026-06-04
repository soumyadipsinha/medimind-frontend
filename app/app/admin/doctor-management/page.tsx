"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from "@/services/doctor.services";
import { getDepartments } from "@/services/department.services";
import PageWrapper from "@/components/PageWrapper";
import DoctorTable from "./components/DoctorTable";
import DoctorModal from "./components/DoctorModal";
import { toast } from "sonner";

export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [specFilter, setSpecFilter] = useState<string>("All");

  const [doctorForm, setDoctorForm] = useState<{
    id: string;
    name: string;
    email: string;
    password?: string;
    qualification: string;
    specialization: string;
    department: string;
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
  }>({
    id: "",
    name: "",
    email: "",
    password: "",
    qualification: "",
    specialization: "",
    department: "",
    experience: "",
    registrationNumber: "",
    consultationFee: "50",
    scheduleType: "weekly",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime: "09:00",
    endTime: "17:00",
    maxPatientsPerDay: "15",
    bio: "",
    avatarUrl: ""
  });
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (doctorForm.availableDays.length === 0) {
      toast.warning("Please select at least one available day / date.");
      return;
    }
    try {
      if (doctorForm.id) {
        await updateDoctor(doctorForm.id, doctorForm);
        toast.success("Doctor details updated successfully!");
      } else {
        await createDoctor(doctorForm);
        toast.success("Doctor created successfully!");
      }
      fetchDoctors();
      setShowDoctorModal(false);
    } catch (err: any) {
      toast.error(err.message || "Error saving doctor");
    }
  };

  const handleDoctorDelete = async (id: string) => {
    if (confirm("Delete this doctor account?")) {
      try {
        await deleteDoctor(id);
        toast.success("Doctor deleted successfully!");
        fetchDoctors();
      } catch (err: any) {
        toast.error(err.message || "Error deleting doctor");
      }
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

  const handleDayToggle = (day: string) => {
    setDoctorForm(prev => {
      const isSelected = prev.availableDays.includes(day);
      const days = isSelected 
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: days };
    });
  };

  const handleScheduleTypeChange = (type: "weekly" | "monthly") => {
    setDoctorForm(prev => ({
      ...prev,
      scheduleType: type,
      availableDays: type === "weekly" 
        ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        : ["1", "15"]
    }));
  };

  // Filter and Sort Logic
  const filteredDoctors = doctors
    .filter((doc) => {
      const docName = doc.user?.name || "";
      const matchesSearch = docName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpec = specFilter === "All" || doc.specialization === specFilter;
      
      return matchesSearch && matchesSpec;
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
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const monthlyDays = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  // Distinct specializations for filter
  const specializations = Array.from(new Set(doctors.map(d => d.specialization)));

  return (
    <PageWrapper
      title="Clinic Practitioners"
      description="Manage doctor profiles, consultation availability, and fees."
      actions={
        <button 
          onClick={() => {
            setDoctorForm({
              id: "",
              name: "",
              email: "",
              password: "",
              qualification: "",
              specialization: "",
              department: "",
              experience: "",
              registrationNumber: "",
              consultationFee: "50",
              scheduleType: "weekly",
              availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              startTime: "09:00",
              endTime: "17:00",
              maxPatientsPerDay: "15",
              bio: "",
              avatarUrl: ""
            });
            setShowDoctorModal(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Add Doctor
        </button>
      }
    >
      <div className="flex flex-col gap-6">

      {/* Advanced Filters */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-1 min-w-[240px] items-center gap-3 bg-muted border border-border px-3 py-2 rounded-lg">
          <input 
            type="text" 
            placeholder="Search doctors by name or specialty..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm w-full border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Specialization:</span>
          <select 
            value={specFilter}
            onChange={(e) => { setSpecFilter(e.target.value); setCurrentPage(1); }}
            className="bg-muted border border-border p-2 rounded-lg text-sm text-foreground outline-none"
          >
            <option value="All">All Specialties</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <DoctorTable
        currentItems={currentItems}
        toggleSort={toggleSort}
        setDoctorForm={setDoctorForm}
        setShowDoctorModal={setShowDoctorModal}
        handleDoctorDelete={handleDoctorDelete}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        filteredCount={filteredDoctors.length}
      />

      {/* CRUD Modal */}
      {showDoctorModal && (
        <DoctorModal
          doctorForm={doctorForm}
          setDoctorForm={setDoctorForm}
          handleDoctorSubmit={handleDoctorSubmit}
          setShowDoctorModal={setShowDoctorModal}
          handleScheduleTypeChange={handleScheduleTypeChange}
          handleDayToggle={handleDayToggle}
          weekDays={weekDays}
          monthlyDays={monthlyDays}
          departments={departments}
        />
      )}
    </div>
  </PageWrapper>
  );
}
