"use client";
import React from "react";
import { Edit3, Trash2, ChevronLeft, ChevronRight, Activity, ArrowUpDown } from "lucide-react";

interface DepartmentCardsProps {
  currentItems: any[];
  toggleSort: (field: string) => void;
  setDeptForm: (form: any) => void;
  setShowDeptModal: (show: boolean) => void;
  handleDeptDelete: (id: string) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  filteredCount: number;
}

export default function DepartmentCards({
  currentItems,
  toggleSort,
  setDeptForm,
  setShowDeptModal,
  handleDeptDelete,
  totalPages,
  currentPage,
  setCurrentPage,
  indexOfFirstItem,
  indexOfLastItem,
  filteredCount,
}: DepartmentCardsProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Sort Buttons / Controls */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-card border border-border p-3.5 rounded-xl w-fit">
        <span>Sort By:</span>
        <button
          onClick={() => toggleSort("name")}
          className="flex items-center gap-1 hover:text-foreground transition-all"
        >
          Name <ArrowUpDown className="size-3" />
        </button>
        <div className="w-px h-3.5 bg-border mx-1" />
        <button
          onClick={() => toggleSort("status")}
          className="flex items-center gap-1 hover:text-foreground transition-all"
        >
          Status <ArrowUpDown className="size-3" />
        </button>
      </div>

      {/* Grid Layout for Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((dept) => (
          <div
            key={dept._id}
            className="bg-card border border-border hover:border-primary/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-all duration-300" />
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Activity className="size-5" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground truncate max-w-[180px]">
                    {dept.name}
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  dept.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"
                }`}>
                  {dept.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {dept.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-3 mt-2">
              <button
                onClick={() => {
                  setDeptForm({ id: dept._id, name: dept.name, description: dept.description, status: dept.status });
                  setShowDeptModal(true);
                }}
                className="p-2 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all flex items-center gap-1 text-xs font-bold"
              >
                <Edit3 className="size-4" /> Edit
              </button>
              <button
                onClick={() => handleDeptDelete(dept._id)}
                className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-all flex items-center gap-1 text-xs font-bold"
              >
                <Trash2 className="size-4" /> Delete
              </button>
            </div>
          </div>
        ))}

        {currentItems.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card border border-border border-dashed rounded-2xl">
            No departments found.
          </div>
        )}
      </div>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="p-4 border border-border rounded-xl flex items-center justify-between bg-card">
          <span className="text-xs text-muted-foreground">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCount)} of {filteredCount} departments
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-border rounded-lg disabled:opacity-50 text-muted-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold text-foreground px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-border rounded-lg disabled:opacity-50 text-muted-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
