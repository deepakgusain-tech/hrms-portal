"use client";

import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { reviewTaskSubmission } from "@/lib/actions/tasks";

type SubmissionRow = {
  id: string;
  summary: string;
  reviewStatus: string;
  reviewerTag: string;
  reviewRemark: string | null;
  createdAt: Date;
  employee: {
    employeeName: string;
    employeeCode: string;
  };
  task: {
    title: string;
    project: {
      name: string;
    };
  };
};

export default function ReviewList({
  submissions,
}: {
  submissions: SubmissionRow[];
}) {
  const [remarks, setRemarks] = React.useState<Record<string, string>>({});
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const handleReview = async (
    submissionId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    setPendingId(submissionId);
    const res = await reviewTaskSubmission(
      submissionId,
      status,
      remarks[submissionId] || "",
    );
    setPendingId(null);

    if (!res.success) {
      toast.error("Error", { description: res.message });
      return;
    }

    toast.success("Success", { description: res.message });
  };

  if (!submissions.length) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center text-slate-500">
          No task submissions found for review.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <Card key={submission.id} className="rounded-2xl border-slate-200">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {submission.task.project.name} - {submission.task.title}
                </p>
                <p className="text-sm text-slate-500">
                  {submission.employee.employeeName} (
                  {submission.employee.employeeCode})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{submission.reviewStatus}</Badge>
                <Badge variant="secondary">{submission.reviewerTag}</Badge>
              </div>
            </div>

            <p className="text-sm text-slate-700">{submission.summary}</p>

            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                placeholder="Review remark"
                value={remarks[submission.id] || ""}
                onChange={(event) =>
                  setRemarks((prev) => ({
                    ...prev,
                    [submission.id]: event.target.value,
                  }))
                }
              />
              <Button
                disabled={pendingId === submission.id}
                onClick={() => handleReview(submission.id, "APPROVED")}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
              <Button
                disabled={pendingId === submission.id}
                onClick={() => handleReview(submission.id, "REJECTED")}
                variant="destructive"
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
