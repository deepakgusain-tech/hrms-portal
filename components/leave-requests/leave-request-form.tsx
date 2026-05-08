"use client";

import * as React from "react";
import { CalendarPlus, Clock3, Send } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { LeaveRequestRecord } from "@/lib/actions/leave-requests";

type LeaveRequestFormProps = {
  initialRequests: LeaveRequestRecord[];
};

const leaveTypes = [
  { value: "CASUAL", label: "Casual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "EARNED", label: "Earned Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
  { value: "OTHER", label: "Other" },
];

const statusClasses: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-700",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function LeaveRequestForm({
  initialRequests,
}: LeaveRequestFormProps) {
  const [requests, setRequests] = React.useState(initialRequests);
  const [leaveType, setLeaveType] = React.useState("CASUAL");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const upcomingRequest = requests[0];

  const submit = () => {
    startTransition(async () => {
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          reason,
        }),
      });
      const result = await response.json();

      if (!result.success) {
        toast.error("Leave Request", { description: result.message });
        return;
      }

      setRequests((current) => [result.data, ...current]);
      setLeaveType("CASUAL");
      setStartDate("");
      setEndDate("");
      setReason("");
      toast.success("Leave Request", { description: result.message });
    });
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarPlus className="size-5 text-cyan-700" />
                Apply for Leave
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Choose leave type, set the date range, and add clear context
                for the reviewer.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <Clock3 className="size-4 text-cyan-700" />
                Latest status
              </div>
              <p className="mt-1">
                {upcomingRequest
                  ? `${upcomingRequest.status} for ${formatDate(upcomingRequest.startDate)}`
                  : "No requests submitted yet"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={leaveType}
              onChange={(event) => setLeaveType(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
              disabled={isPending}
            >
              {leaveTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <input
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
              type="date"
              disabled={isPending}
            />
            <input
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
              type="date"
              disabled={isPending}
            />
          </div>

          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Add the reason, handoff context, or any details HR should know"
            className="min-h-28 border-slate-200 bg-slate-50"
            disabled={isPending}
          />

          <Button
            onClick={submit}
            disabled={isPending}
            className="h-11 bg-cyan-600 px-4 hover:bg-cyan-700"
          >
            <Send />
            Submit Request
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl">My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Dates</th>
                  <th className="px-3 py-3">Days</th>
                  <th className="px-3 py-3">Reason</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Review</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => (
                  <tr
                    key={request.id}
                    className={`border-b border-slate-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    }`}
                  >
                    <td className="px-3 py-3">
                      {request.leaveType.replace("_", " ")}
                    </td>
                    <td className="px-3 py-3">
                      {formatDate(request.startDate)} to{" "}
                      {formatDate(request.endDate)}
                    </td>
                    <td className="px-3 py-3">{request.totalDays}</td>
                    <td className="max-w-[280px] px-3 py-3">
                      <span className="line-clamp-2">{request.reason}</span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={statusClasses[request.status]}>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="max-w-[260px] px-3 py-3 text-slate-600">
                      {request.reviewRemark || "-"}
                    </td>
                  </tr>
                ))}
                {!requests.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-10 text-center text-slate-500"
                    >
                      No leave requests submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
