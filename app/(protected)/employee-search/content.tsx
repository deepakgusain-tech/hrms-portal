"use client";

import { useState, useCallback } from "react";
import FilterPanel from "@/components/dashboard-design/filter-panel";
import EmployeeList from "@/components/dashboard-design/employee-list";
import {
  getFilteredEmployeeProfiles,
  EmployeeFilters,
} from "@/lib/actions/employee-profiles";
import { EmployeeProfile } from "@/types";

interface DashboardDesignContentProps {
  initialEmployees: EmployeeProfile[];
  companies: Array<{ id: string; companyName: string }>;
  departments: Array<{ id: string; name: string }>;
  jobRoles: Array<{ id: string; name: string }>;
  workLocations: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
}

export default function DashboardDesignContent({
  initialEmployees,
  companies,
  departments,
  jobRoles,
  workLocations,
  projects
}: DashboardDesignContentProps) {
  const [employees, setEmployees] = useState<EmployeeProfile[]>(initialEmployees);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyFilters = useCallback(async (filters: EmployeeFilters) => {
    setIsLoading(true);
    try {
      const filtered = await getFilteredEmployeeProfiles(filters);
      setEmployees(filtered);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetFilters = useCallback(async () => {
    setIsLoading(true);
    try {
      const allEmployees = await getFilteredEmployeeProfiles({});
      setEmployees(allEmployees);
    } catch (error) {
      console.error("Error resetting filters:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex mt-[-30px] bg-gray-100">
      <FilterPanel
        companies={companies}
        departments={departments}
        jobRoles={jobRoles}
        workLocations={workLocations}
        projects={projects}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
      <div className="flex-1 overflow-auto">
        <div className="p-2 mt-5">
          <EmployeeList employees={employees} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
