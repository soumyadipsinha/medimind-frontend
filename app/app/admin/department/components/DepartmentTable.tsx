"use client";
import React from "react";
import { Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface DepartmentTableProps {
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

export default function DepartmentTable({
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
}: DepartmentTableProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => toggleSort("name")} className="cursor-pointer select-none">
              <div className="flex items-center gap-1">
                Department Name <ArrowUpDown className="size-3.5" />
              </div>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead onClick={() => toggleSort("status")} className="cursor-pointer select-none">
              <div className="flex items-center gap-1">
                Status <ArrowUpDown className="size-3.5" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((dept) => (
            <TableRow key={dept._id}>
              <TableCell className="font-bold text-foreground">{dept.name}</TableCell>
              <TableCell className="max-w-md truncate text-muted-foreground">{dept.description}</TableCell>
              <TableCell>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  dept.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"
                }`}>
                  {dept.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      setDeptForm({ id: dept._id, name: dept.name, description: dept.description, status: dept.status });
                      setShowDeptModal(true);
                    }}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button 
                    onClick={() => handleDeptDelete(dept._id)}
                    className="p-1 hover:bg-muted rounded text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {currentItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No departments found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between bg-card/20">
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
