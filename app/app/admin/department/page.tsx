"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/services/department.services";
import PageWrapper from "@/components/PageWrapper";
import DepartmentCards from "./components/DepartmentCards";
import { toast } from "sonner";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [deptForm, setDeptForm] = useState({ id: "", name: "", description: "", status: "Active" });
  const [showDeptModal, setShowDeptModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
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

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (deptForm.id) {
        await updateDepartment(deptForm.id, deptForm);
      } else {
        await createDepartment(deptForm);
        toast.success("Department saved successfully!");
      }
      fetchDepartments();
      setShowDeptModal(false);
      setDeptForm({ id: "", name: "", description: "", status: "Active" });
    } catch (err: any) {
      toast.error(err.message || "Error saving department");
    }
  };

  const handleDeptDelete = async (id: string) => {
    if (confirm("Delete this department?")) {
      try {
        await deleteDepartment(id);
        toast.success("Department deleted successfully!");
        fetchDepartments();
      } catch (err: any) {
        toast.error(err.message || "Error deleting department");
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

  // Filter and Sort Logic
  const filteredDepartments = departments
    .filter((dept) => {
      const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        dept.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || dept.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let valA = a[sortField]?.toString().toLowerCase() || "";
      let valB = b[sortField]?.toString().toLowerCase() || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  return (
    <PageWrapper
      title="Clinic Departments"
      description="Manage active hospital wards and administrative wings."
      actions={
        <button 
          onClick={() => {
            setDeptForm({ id: "", name: "", description: "", status: "Active" });
            setShowDeptModal(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Add Department
        </button>
      }
    >
      <div className="flex flex-col gap-6">

      {/* Advanced Filters */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-1 min-w-[240px] items-center gap-3 bg-muted border border-border px-3 py-2 rounded-lg">
          <input 
            type="text" 
            placeholder="Search by name or description..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm w-full border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-muted border border-border p-2 rounded-lg text-sm text-foreground outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Card Section */}
      <DepartmentCards
        currentItems={currentItems}
        toggleSort={toggleSort}
        setDeptForm={setDeptForm}
        setShowDeptModal={setShowDeptModal}
        handleDeptDelete={handleDeptDelete}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        filteredCount={filteredDepartments.length}
      />

      {/* CRUD Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleDeptSubmit} className="bg-card border border-border p-6 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4">
            <h3 className="font-bold text-lg text-foreground">{deptForm.id ? "Edit Department" : "Add New Department"}</h3>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Department Name</label>
              <input type="text" required value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Description</label>
              <textarea required value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none h-20" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Status</label>
              <select value={deptForm.status} onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  </PageWrapper>
  );
}
