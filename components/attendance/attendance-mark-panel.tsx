"use client";

import * as React from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AttendanceRecord } from "@/lib/actions/attendance";

type AttendanceMarkPanelProps = {
  employeeId: string;
  employees?: {
    id: string;
    employeeName: string;
    employeeCode: string;
  }[];
  todayRecord?: AttendanceRecord;
  canCreate: boolean;
  canChooseEmployee?: boolean;
};

function formatTime(value?: string) {
  if (!value) return "--:--";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AttendanceMarkPanel({
  employeeId,
  employees = [],
  todayRecord,
  canCreate,
  canChooseEmployee = false,
}: AttendanceMarkPanelProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState(employeeId);
  const [record, setRecord] = React.useState(todayRecord);
  const [remarks, setRemarks] = React.useState(todayRecord?.remarks ?? "");
  const [isPending, startTransition] = React.useTransition();

  const mark = () => {
    startTransition(async () => {
      const response = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: selectedEmployeeId,
          remarks,
        }),
      });
      const result = await response.json();

      if (!result.success) {
        toast.error("Attendance", { description: result.message });
        return;
      }

      setRecord(result.data);
      toast.success("Attendance", { description: result.message });
    });
  };

  const hasCheckedIn = !!record?.checkIn;
  const hasCheckedOut = !!record?.checkOut;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Clock className="size-5 text-blue-600" />
          Today Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Check In
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatTime(record?.checkIn)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Check Out
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatTime(record?.checkOut)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Hours
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {record?.workingHours?.toFixed(2) ?? "0.00"}
            </p>
          </div>
        </div>

        {canChooseEmployee && (
          <select
            value={selectedEmployeeId}
            onChange={(event) => {
              setSelectedEmployeeId(event.target.value);
              setRecord(undefined);
              setRemarks("");
            }}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            disabled={isPending}
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.employeeName} ({employee.employeeCode})
              </option>
            ))}
          </select>
        )}

        <Textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          placeholder="Remarks"
          className="min-h-24"
          disabled={!canCreate || hasCheckedOut}
        />

        <Button
          onClick={mark}
          disabled={!canCreate || isPending || hasCheckedOut}
          className="h-10 bg-blue-600 px-4 hover:bg-blue-700"
        >
          {hasCheckedIn ? <LogOut /> : <LogIn />}
          {hasCheckedIn ? "Check Out" : "Check In"}
        </Button>
      </CardContent>
    </Card>
  );
}
