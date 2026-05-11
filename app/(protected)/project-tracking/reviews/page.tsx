import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canAccess } from "@/lib/rbac";
import { getTaskSubmissionsForReview } from "@/lib/actions/tasks";
import ReviewList from "./review-list";

export default async function TaskSubmissionReviewsPage() {
  const canView = await canAccess("/project-tracking", "view");

  if (!canView) {
    redirect("/404");
  }

  const submissions = await getTaskSubmissionsForReview();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Task Update Reviews
          </h1>
          <p className="text-sm text-slate-500">
            Review employee daily task updates by project and assignment.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/project-tracking">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      <ReviewList submissions={submissions} />
    </div>
  );
}
