"use client";
import React from "react";
import { Edit3, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface ClinicServiceTableProps {
  currentItems: any[];
  toggleSort: (field: string) => void;
  setServiceForm: (form: any) => void;
  setShowServiceModal: (show: boolean) => void;
  handleServiceDelete: (id: string) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  filteredCount: number;
}

export default function ClinicServiceTable({
  currentItems,
  toggleSort,
  setServiceForm,
  setShowServiceModal,
  handleServiceDelete,
  totalPages,
  currentPage,
  setCurrentPage,
  indexOfFirstItem,
  indexOfLastItem,
  filteredCount,
}: ClinicServiceTableProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => toggleSort("name")} className="cursor-pointer select-none">
              <div className="flex items-center gap-1">
                Test Name <ArrowUpDown className="size-3.5" />
              </div>
            </TableHead>
            <TableHead>Assigned Departments</TableHead>
            <TableHead onClick={() => toggleSort("price")} className="cursor-pointer select-none">
              <div className="flex items-center gap-1">
                Price <ArrowUpDown className="size-3.5" />
              </div>
            </TableHead>
            <TableHead>Delivery Window</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((ser) => (
            <TableRow key={ser._id}>
              <TableCell className="font-bold text-foreground">{ser.name}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">
                {ser.departments && ser.departments.length > 0 
                  ? ser.departments.map((d: any) => d.name).join(", ") 
                  : "N/A"}
              </TableCell>
              <TableCell className="font-black text-primary">${ser.price}</TableCell>
              <TableCell className="text-muted-foreground">{ser.reportDeliveryTime}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => {
                      const deptIds = ser.departments ? ser.departments.map((d: any) => d._id) : [];
                      setServiceForm({
                        id: ser._id,
                        name: ser.name,
                        departments: deptIds,
                        price: ser.price.toString(),
                        description: ser.description,
                        reportDeliveryTime: ser.reportDeliveryTime
                      });
                      setShowServiceModal(true);
                    }}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button 
                    onClick={() => handleServiceDelete(ser._id)}
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
                No clinic services found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between bg-card/20">
          <span className="text-xs text-muted-foreground">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCount)} of {filteredCount} tests
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
