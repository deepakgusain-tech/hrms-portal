"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { EmployeeFilters } from "@/lib/actions/employee-profiles";

interface FilterPanelProps {
  companies: Array<{ id: string; companyName: string }>;
  departments: Array<{ id: string; name: string }>;
  jobRoles: Array<{ id: string; name: string }>;
  workLocations: Array<{ id: string; name: string }>;
  onApplyFilters: (filters: EmployeeFilters) => void;
  onResetFilters: () => void;
}

export default function FilterPanel({
  companies,
  departments,
  jobRoles,
  workLocations,
  onApplyFilters,
  onResetFilters,
}: FilterPanelProps) {
  const [filters, setFilters] = useState<EmployeeFilters>({});

  const handleInputChange = (key: keyof EmployeeFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
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
    <div className="w-80 h-screen overflow-y-auto border-r p-4 space-y-4 bg-white sticky top-0">
      <div className="space-y-2">
        <h2 className="font-semibold text-lg text-gray-900">Filters</h2>
        <p className="text-sm text-gray-500">
          {Object.values(filters).filter(Boolean).length} active filter
          {Object.values(filters).filter(Boolean).length !== 1 ? "s" : ""}
        </p>
      </div>

      <Accordion type="multiple" defaultValue={["identity", "organization"]}>
        {/* 🔍 Employee Identity */}
        <AccordionItem value="identity">
          <AccordionTrigger className="text-sm font-semibold">
            Employee Identity
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Employee ID
              </label>
              <Input
                placeholder="Enter Employee ID"
                value={filters.employeeId || ""}
                onChange={(e) => handleInputChange("employeeId", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Full Name
              </label>
              <Input
                placeholder="Enter Full Name"
                value={filters.employeeName || ""}
                onChange={(e) => handleInputChange("employeeName", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Phone Number
              </label>
              <Input
                placeholder="Enter Phone Number"
                value={filters.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 🏢 Organization */}
        <AccordionItem value="organization">
          <AccordionTrigger className="text-sm font-semibold">
            Organization
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Company
              </label>
              <Select
                value={filters.companyId || ""}
                onValueChange={(value) => handleInputChange("companyId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Department
              </label>
              <Select
                value={filters.departmentId || ""}
                onValueChange={(value) => handleInputChange("departmentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Work Location
              </label>
              <Select
                value={filters.workLocationId || ""}
                onValueChange={(value) => handleInputChange("workLocationId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {workLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 💼 Job & Role */}
        <AccordionItem value="job">
          <AccordionTrigger className="text-sm font-semibold">
            Job & Role
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Job Role
              </label>
              <Select
                value={filters.jobRoleId || ""}
                onValueChange={(value) => handleInputChange("jobRoleId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 📅 Time Filters */}
        <AccordionItem value="time">
          <AccordionTrigger className="text-sm font-semibold">
            Time-Based
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Joining Date From
              </label>
              <Input
                type="date"
                value={filters.joiningDateFrom || ""}
                onChange={(e) =>
                  handleInputChange("joiningDateFrom", e.target.value)
                }
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Joining Date To
              </label>
              <Input
                type="date"
                value={filters.joiningDateTo || ""}
                onChange={(e) => handleInputChange("joiningDateTo", e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 📊 Status */}
        <AccordionItem value="status">
          <AccordionTrigger className="text-sm font-semibold">
            Status
          </AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Employee Status
              </label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-2 sticky bottom-0 bg-white pt-4 border-t">
        <Button
          onClick={handleApply}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Apply Filters
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full border-gray-300"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
