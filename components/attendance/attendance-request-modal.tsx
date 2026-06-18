"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AttendanceRequestModalProps = {
  employeeId: string;
  attendanceId?: string;
  disabled?: boolean;
};

const attendanceRequestTypes = [
  { value: "HALF_DAY", label: "Half Day" },
  { value: "WFH", label: "Work From Home" },
  { value: "OD", label: "On Duty" },
  { value: "OUT_OF_STATION", label: "Out Of Station" },
];

export function AttendanceRequestModal({
  employeeId,
  attendanceId,
  disabled = false,
}: AttendanceRequestModalProps) {
  const [open, setOpen] = React.useState(false);
  const [requestType, setRequestType] = React.useState("HALF_DAY");
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  const submitRequest = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.error("Attendance Request", {
        description: "Reason is required",
      });
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/attendance-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          attendanceId,
          requestType,
          reason: trimmedReason,
          notes: notes.trim(),
        }),
      });
      const result = await response.json();

      if (!result.success) {
        toast.error("Attendance Request", { description: result.message });
        return;
      }

      toast.success("Attendance Request", { description: result.message });
      setReason("");
      setNotes("");
      setRequestType("HALF_DAY");
      setOpen(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        className="h-11 border-cyan-200 bg-white text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Send className="size-4" />
        Attendance Request
      </Button>

      <SheetContent className="overflow-y-auto sm:!max-w-lg">
        <SheetHeader className="space-y-2 pr-10">
          <SheetTitle className="text-xl">Submit Attendance Request</SheetTitle>
          <SheetDescription>
            Request approval for half day, WFH, OD, or out of station without changing today&apos;s attendance record immediately.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Attendance Type
            </label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger className="h-12 w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-slate-200">
                {attendanceRequestTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reason
            </label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this request should be approved"
              className="min-h-28 rounded-2xl border-slate-200 bg-white shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional extra context"
              className="min-h-24 rounded-2xl border-slate-200 bg-white shadow-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              className="h-11 flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-95"
              onClick={submitRequest}
              disabled={disabled || isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Submit Request
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-slate-200 bg-white"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
