"use client";
import React from "react";
import { Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface DoctorTableProps {
  currentItems: any[];
  toggleSort: (field: string) => void;
  setDoctorForm: (form: any) => void;
  setShowDoctorModal: (show: boolean) => void;
  handleDoctorDelete: (id: string) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  filteredCount: number;
}

export default function DoctorTable({
  currentItems,
  toggleSort,
  setDoctorForm,
  setShowDoctorModal,
  handleDoctorDelete,
  totalPages,
  currentPage,
  setCurrentPage,
  indexOfFirstItem,
  indexOfLastItem,
  filteredCount,
}: DoctorTableProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => toggleSort("name")} className="cursor-pointer select-none">
              <div className="flex items-center gap-1">
                Practitioner <ArrowUpDown className="size-3.5" />
              </div>
            </TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Availability Schedule</TableHead>
            <TableHead onClick={() => toggleSort("consultationFee")} className="cursor-pointer select-none">
              <div className="flex items-center gap-1">
                Fee <ArrowUpDown className="size-3.5" />
              </div>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((doc) => (
            <TableRow key={doc._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {doc.user?.name ? doc.user.name[0] : "D"}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{doc.user?.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.qualification}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-primary">{doc.specialization}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                <span className="capitalize text-xs font-bold bg-muted px-2 py-0.5 rounded border border-border mr-1.5">
                  {doc.scheduleType || "weekly"}
                </span>
                {doc.availableDays ? doc.availableDays.join(", ") : ""}
              </TableCell>
              <TableCell className="font-bold text-foreground">${doc.consultationFee}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      setDoctorForm({
                        id: doc._id,
                        name: doc.user?.name || "",
                        email: doc.user?.email || "",
                        qualification: doc.qualification,
                        specialization: doc.specialization,
                        department: doc.department || "",
                        experience: doc.experience.toString(),
                        registrationNumber: doc.registrationNumber,
                        consultationFee: doc.consultationFee.toString(),
                        scheduleType: doc.scheduleType || "weekly",
                        availableDays: doc.availableDays || [],
                        startTime: doc.startTime,
                        endTime: doc.endTime,
                        maxPatientsPerDay: doc.maxPatientsPerDay.toString(),
                        bio: doc.bio || "",
                        avatarUrl: doc.user?.avatarUrl || ""
                      });
                      setShowDoctorModal(true);
                    }}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button 
                    onClick={() => handleDoctorDelete(doc._id)}
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
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                No practitioners found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between bg-card/20">
          <span className="text-xs text-muted-foreground">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCount)} of {filteredCount} doctors
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
