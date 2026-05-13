"use client";

import * as React from "react";
import { Clock, LogIn, LogOut, NotebookPen } from "lucide-react";
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
  const canMarkAttendance = canCreate && !!selectedEmployeeId;
  const statusLabel = record?.status?.replaceAll("_", " ") || "Ready";

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="size-5 text-cyan-700" />
            Today Attendance
          </CardTitle>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            <span className="h-2 w-2 rounded-full bg-cyan-600" />
            {statusLabel}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase text-emerald-700">
              Check In
            </p>
            <p className="mt-2 text-2xl font-semibold text-emerald-900">
              {formatTime(record?.checkIn)}
            </p>
          </div>
          <div className="rounded-lg border border-sky-100 bg-sky-50 p-4">
            <p className="text-xs font-medium uppercase text-sky-700">
              Check Out
            </p>
            <p className="mt-2 text-2xl font-semibold text-sky-900">
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
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Employee
            </p>
            <select
              value={selectedEmployeeId}
              onChange={(event) => {
                setSelectedEmployeeId(event.target.value);
                setRecord(undefined);
                setRemarks("");
              }}
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"
              disabled={isPending}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employeeName} ({employee.employeeCode})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <NotebookPen className="size-4 text-cyan-700" />
            Remarks
          </div>
          <Textarea
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Add shift notes, late arrival context, or any attendance remarks"
            className="min-h-24 border-slate-200 bg-white"
            disabled={!canMarkAttendance || hasCheckedOut}
          />
        </div>

        {!selectedEmployeeId && (
          <p className="text-sm text-rose-600">
            Your user is not linked to an employee profile. Please link an
            employee profile before checking in.
          </p>
        )}

        <Button
          onClick={mark}
          disabled={!canMarkAttendance || isPending || hasCheckedOut}
          className="h-11 bg-cyan-600 px-4 hover:bg-cyan-700"
        >
          {hasCheckedIn ? <LogOut /> : <LogIn />}
          {hasCheckedIn ? "Check Out" : "Check In"}
        </Button>
      </CardContent>
    </Card>
  );
}
