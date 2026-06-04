"use client";
import React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface PatientTableProps {
  currentItems: any[];
  toggleSort: (field: string) => void;
  selectedPatientLog: any | null;
  handleSelectPatientLog: (id: string) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function PatientTable({
  currentItems,
  toggleSort,
  selectedPatientLog,
  handleSelectPatientLog,
  totalPages,
  currentPage,
  setCurrentPage,
}: PatientTableProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => toggleSort("name")} className="cursor-pointer select-none">
              <div className="flex items-center gap-1">
                Patient <ArrowUpDown className="size-3.5" />
              </div>
            </TableHead>
            <TableHead>Contact info</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((pat) => {
            const isSelected = selectedPatientLog?.patient?._id === pat._id;
            return (
              <TableRow key={pat._id} className={isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""}>
                <TableCell>
                  <div className="font-bold text-foreground">{pat.user?.name}</div>
                  <div className="text-xs text-muted-foreground">Mobile: {pat.mobileNumber}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{pat.user?.email}</TableCell>
                <TableCell className="text-right">
                  <button 
                    onClick={() => handleSelectPatientLog(pat._id)}
                    className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 ml-auto"
                  >
                    <Eye className="size-3.5" /> Inspect
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
          {currentItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                No patients found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between bg-card/20">
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-border rounded-lg disabled:opacity-50 text-muted-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
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
