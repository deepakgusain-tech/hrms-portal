"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeFilters } from "@/lib/actions/employee-profiles";

interface FilterPanelProps {
  companies: Array<{ id: string; companyName: string }>;
  departments: Array<{ id: string; name: string }>;
  jobRoles: Array<{ id: string; name: string }>;
  workLocations: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
  onApplyFilters: (filters: EmployeeFilters) => void;
  onResetFilters: () => void;
}

const selectAllValue = "ALL";
const fieldClass =
  "h-10 rounded-xl border-slate-200 bg-slate-50 text-sm shadow-none";
const labelClass = "text-xs font-semibold text-slate-600";

export default function FilterPanel({
  companies,
  departments,
  jobRoles,
  workLocations,
  projects,
  onApplyFilters,
  onResetFilters,
}: FilterPanelProps) {
  const [filters, setFilters] = useState<EmployeeFilters>({});

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleInputChange = (key: keyof EmployeeFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value && value !== selectAllValue ? value : undefined,
    }));
  };

  const handleReset = useCallback(() => {
    setFilters({});
    onResetFilters();
  }, [onResetFilters]);

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
  }, [filters, onApplyFilters]);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Employee Filters</h2>
          <p className="text-sm text-slate-500">
            {activeFilterCount} active filter{activeFilterCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-1.5">
          <label className={labelClass}>Employee ID</label>
          <Input
            placeholder="Enter employee ID"
            value={filters.employeeId || ""}
            onChange={(e) => handleInputChange("employeeId", e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Full Name</label>
          <Input
            placeholder="Enter full name"
            value={filters.employeeName || ""}
            onChange={(e) => handleInputChange("employeeName", e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Phone Number</label>
          <Input
            placeholder="Enter phone number"
            value={filters.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Project</label>
          <Select
            value={filters.project || selectAllValue}
            onValueChange={(value) => handleInputChange("project", value)}
          >
            <SelectTrigger className={`w-full ${fieldClass}`}>
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={selectAllValue}>All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Company</label>
          <Select
            value={filters.companyId || selectAllValue}
            onValueChange={(value) => handleInputChange("companyId", value)}
          >
            <SelectTrigger className={`w-full ${fieldClass}`}>
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={selectAllValue}>All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Department</label>
          <Select
            value={filters.departmentId || selectAllValue}
            onValueChange={(value) => handleInputChange("departmentId", value)}
          >
            <SelectTrigger className={`w-full ${fieldClass}`}>
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={selectAllValue}>All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Work Location</label>
          <Select
            value={filters.workLocationId || selectAllValue}
            onValueChange={(value) => handleInputChange("workLocationId", value)}
          >
            <SelectTrigger className={`w-full ${fieldClass}`}>
              <SelectValue placeholder="Work Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={selectAllValue}>All Locations</SelectItem>
              {workLocations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Job Role</label>
          <Select
            value={filters.jobRoleId || selectAllValue}
            onValueChange={(value) => handleInputChange("jobRoleId", value)}
          >
            <SelectTrigger className={`w-full ${fieldClass}`}>
              <SelectValue placeholder="Job Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={selectAllValue}>All Roles</SelectItem>
              {jobRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Joining From</label>
          <Input
            type="date"
            value={filters.joiningDateFrom || ""}
            onChange={(e) =>
              handleInputChange("joiningDateFrom", e.target.value)
            }
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Joining To</label>
          <Input
            type="date"
            value={filters.joiningDateTo || ""}
            onChange={(e) => handleInputChange("joiningDateTo", e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Status</label>
          <Select
            value={filters.status || selectAllValue}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger className={`w-full ${fieldClass}`}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={selectAllValue}>All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-5 sm:col-span-2 lg:col-span-3 xl:col-span-2">
          <Button
            onClick={handleApply}
            className="h-10 flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Apply
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-10 flex-1 rounded-xl border-slate-300 bg-white"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
