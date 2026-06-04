"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getClinicServices, createClinicService, updateClinicService, deleteClinicService } from "@/services/clinicService.services";
import { getDepartments } from "@/services/department.services";
import PageWrapper from "@/components/PageWrapper";
import ClinicServiceTable from "./components/ClinicServiceTable";
import { toast } from "sonner";

export default function ClinicServicePage() {
  const [services, setServices] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deptFilter, setDeptFilter] = useState<string>("All");

  const [serviceForm, setServiceForm] = useState<{
    id: string;
    name: string;
    departments: string[];
    price: string;
    description: string;
    reportDeliveryTime: string;
  }>({
    id: "",
    name: "",
    departments: [],
    price: "",
    description: "",
    reportDeliveryTime: "24 Hours"
  });
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchServices();
    fetchDepartments();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await getClinicServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceForm.departments.length === 0) {
      toast.warning("Please select at least one department.");
      return;
    }
    try {
      if (serviceForm.id) {
        await updateClinicService(serviceForm.id, serviceForm);
        toast.success("Service updated successfully!");
      } else {
        await createClinicService(serviceForm);
        toast.success("Service created successfully!");
      }
      fetchServices();
      setShowServiceModal(false);
      setServiceForm({ id: "", name: "", departments: [], price: "", description: "", reportDeliveryTime: "24 Hours" });
    } catch (err: any) {
      toast.error(err.message || "Error saving service");
    }
  };

  const handleServiceDelete = async (id: string) => {
    if (confirm("Delete this test/service?")) {
      try {
        await deleteClinicService(id);
        toast.success("Service deleted successfully!");
        fetchServices();
      } catch (err: any) {
        toast.error(err.message || "Error deleting service");
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

  const handleDeptCheckboxChange = (deptId: string, checked: boolean) => {
    setServiceForm(prev => {
      const depts = checked
        ? [...prev.departments, deptId]
        : prev.departments.filter(id => id !== deptId);
      return { ...prev, departments: depts };
    });
  };

  // Filter and Sort Logic
  const filteredServices = services
    .filter((ser) => {
      const matchesSearch = ser.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ser.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = deptFilter === "All" || 
        (ser.departments && ser.departments.some((d: any) => d._id === deptFilter));
      
      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  return (
    <PageWrapper
      title="Clinical Services & Tests"
      description="Configure laboratory tests, medical diagnostics, and service prices."
      actions={
        <button 
          onClick={() => {
            setServiceForm({ id: "", name: "", departments: [], price: "", description: "", reportDeliveryTime: "24 Hours" });
            setShowServiceModal(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Add Test/Service
        </button>
      }
    >
      <div className="flex flex-col gap-6">

      {/* Advanced Filters */}
      <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-1 min-w-[240px] items-center gap-3 bg-muted border border-border px-3 py-2 rounded-lg">
          <input 
            type="text" 
            placeholder="Search tests by name or description..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm w-full border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Filter Department:</span>
          <select 
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            className="bg-muted border border-border p-2 rounded-lg text-sm text-foreground outline-none"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <ClinicServiceTable
        currentItems={currentItems}
        toggleSort={toggleSort}
        setServiceForm={setServiceForm}
        setShowServiceModal={setShowServiceModal}
        handleServiceDelete={handleServiceDelete}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        filteredCount={filteredServices.length}
      />

      {/* CRUD Modal with Multi-department selection checkboxes */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleServiceSubmit} className="bg-card border border-border p-6 rounded-2xl w-full max-w-md shadow-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg text-foreground">{serviceForm.id ? "Edit Lab Service" : "Add Lab Service"}</h3>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Test Name</label>
              <input type="text" required value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Assigned Departments (Select Multiple)</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5 max-h-40 overflow-y-auto bg-muted border border-border p-3 rounded-lg">
                {departments.map((d) => {
                  const isChecked = serviceForm.departments.includes(d._id);
                  return (
                    <label key={d._id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleDeptCheckboxChange(d._id, e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary size-4"
                      />
                      <span className="truncate">{d.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Price ($)</label>
                <input type="number" required value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Delivery Window</label>
                <input type="text" placeholder="24 Hours" required value={serviceForm.reportDeliveryTime} onChange={(e) => setServiceForm({ ...serviceForm, reportDeliveryTime: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Description</label>
              <textarea required value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full bg-muted border border-border p-2.5 rounded-lg mt-1 text-sm text-foreground outline-none h-16" />
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/95 px-4 py-2 rounded-lg text-sm font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  </PageWrapper>
  );
}
