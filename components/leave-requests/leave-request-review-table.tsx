"use client";

import * as React from "react";
import { Check, MessageSquareText, X } from "lucide-react";
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

type LeaveRequestReviewTableProps = {
  initialRequests: LeaveRequestRecord[];
};

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

export function LeaveRequestReviewTable({
  initialRequests,
}: LeaveRequestReviewTableProps) {
  const [requests, setRequests] = React.useState(initialRequests);
  const [remarks, setRemarks] = React.useState<Record<string, string>>({});
  const [pendingId, setPendingId] = React.useState("");

  const review = async (id: string, status: "APPROVED" | "REJECTED") => {
    setPendingId(id);
    const response = await fetch(`/api/leave-requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        reviewRemark: remarks[id] || "",
      }),
    });
    const result = await response.json();
    setPendingId("");

    if (!result.success) {
      toast.error("Leave Request", { description: result.message });
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === id ? result.data : request,
      ),
    );
    toast.success("Leave Request", { description: result.message });
  };

  return (
    <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl">Leave Requests</CardTitle>
          <p className="text-sm text-slate-500">
            Pending rows stay editable until a review decision is saved.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-slate-600">
                <th className="px-3 py-3">Employee</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Dates</th>
                <th className="px-3 py-3">Days</th>
                <th className="px-3 py-3">Reason</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Review Remark</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => {
                const isPending = request.status === "PENDING";

                return (
                  <tr
                    key={request.id}
                    className={`border-b border-slate-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">
                        {request.employeeName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {request.employeeCode} - {request.departmentName}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {request.leaveType.replace("_", " ")}
                    </td>
                    <td className="px-3 py-3">
                      {formatDate(request.startDate)} to{" "}
                      {formatDate(request.endDate)}
                    </td>
                    <td className="px-3 py-3">{request.totalDays}</td>
                    <td className="max-w-[240px] px-3 py-3">
                      <span className="line-clamp-2">{request.reason}</span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={statusClasses[request.status]}>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      {isPending ? (
                        <Textarea
                          value={remarks[request.id] || ""}
                          onChange={(event) =>
                            setRemarks((current) => ({
                              ...current,
                              [request.id]: event.target.value,
                            }))
                          }
                          className="min-h-16 min-w-52 border-slate-200 bg-white"
                          placeholder="Optional remark"
                          disabled={pendingId === request.id}
                        />
                      ) : (
                        <span className="inline-flex items-start gap-2 text-slate-600">
                          <MessageSquareText className="mt-0.5 size-4 shrink-0 text-cyan-700" />
                          {request.reviewRemark || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isPending ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={!!pendingId}
                            onClick={() => review(request.id, "APPROVED")}
                          >
                            <Check />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-300"
                            disabled={!!pendingId}
                            onClick={() => review(request.id, "REJECTED")}
                          >
                            <X />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Reviewed by {request.reviewedByName || "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!requests.length && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

