import React from "react";

interface Department {
  _id: string;
  name: string;
}

interface DepartmentTabsProps {
  departments: Department[];
  selectedDeptId: string;
  onTabChange: (deptId: string) => void;
}

export default function DepartmentTabs({
  departments,
  selectedDeptId,
  onTabChange,
}: DepartmentTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
      {departments.map((d) => (
        <button
          key={d._id}
          type="button"
          onClick={() => onTabChange(d._id)}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
            selectedDeptId === d._id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
          }`}
        >
          {d.name}
        </button>
      ))}
    </div>
  );
}
