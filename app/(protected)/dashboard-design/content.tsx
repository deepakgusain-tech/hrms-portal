"use client";

import { useState, useCallback } from "react";
import FilterPanel from "@/components/dashboard-design/filter-panel";
import EmployeeList from "@/components/dashboard-design/employee-list";
import {
  getFilteredEmployeeProfiles,
  EmployeeFilters,
} from "@/lib/actions/employee-profiles";
import { EmployeeProfile } from "@/types";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
  projects,
}: DashboardDesignContentProps) {
  const [employees, setEmployees] =
    useState<EmployeeProfile[]>(initialEmployees);
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

  const { state } = useSidebar();
  console.log(state);

  return (
    <div
      className={cn(
        "space-y-5 rounded-[28px] bg-slate-100/80 p-3 md:p-4",
        state === "collapsed" ? "w-[95vw]" : "w-[80vw]",
      )}
    >
      <FilterPanel
        companies={companies}
        departments={departments}
        jobRoles={jobRoles}
        workLocations={workLocations}
        projects={projects}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
      <div className="">
        <EmployeeList employees={employees} isLoading={isLoading} />
      </div>
    </div>
  );
}
