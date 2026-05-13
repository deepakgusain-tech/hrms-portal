"use client";

import * as React from "react";
import { DataTable } from "@/components/datatable/DataTable";
import {
  deleteEmployeeDocument,
  reviewEmployeeDocument,
} from "@/lib/actions/employee-documents";
import { EmployeeDocument } from "@/types";
import { toast } from "sonner";
import { getEmployeeDocumentColumns } from "./column";
import { EmployeeDocumentReviewSheet } from "@/components/employee-documents/employee-document-review-sheet";

export default function EmployeeDocumentDataTable({
  data,
  canEdit,
  canDelete,
  canReview,
  title,
  actions,
}: {
  data: EmployeeDocument[];
  canEdit: boolean;
  canDelete: boolean;
  canReview: boolean;
  title: string;
  actions?: React.ReactNode;
}) {
  const [tableData, setTableData] = React.useState<EmployeeDocument[]>(data);
  const [activeDocument, setActiveDocument] = React.useState<EmployeeDocument | null>(null);
  const [reviewSheetOpen, setReviewSheetOpen] = React.useState(false);
  const [isReviewing, setIsReviewing] = React.useState(false);

  const deleteHandler = async (id: string) => {
    const res = await deleteEmployeeDocument(id);

    if (!res?.success) {
      toast.error("Error", { description: res?.message });
      return;
    }

    toast.success("Success", { description: res?.message });
    setTableData((prev) => prev.filter((record) => record.id !== id));
  };

  const openReviewSheet = (document: EmployeeDocument) => {
    setActiveDocument(document);
    setReviewSheetOpen(true);
  };

  const reviewHandler = async (
    id: string,
    reviewStatus: "APPROVED" | "REJECTED",
    reviewRemark: string,
  ) => {
    setIsReviewing(true);

    const response = await reviewEmployeeDocument(id, {
      reviewStatus,
      reviewRemark,
    });

    setIsReviewing(false);

    if (!response.success) {
      toast.error("Error", { description: response.message });
      return;
    }

    toast.success("Success", { description: response.message });
    setTableData((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              reviewStatus,
              reviewRemark,
            }
          : record,
      ),
    );
    setReviewSheetOpen(false);
  };

  const columns = getEmployeeDocumentColumns({
    canEdit,
    canDelete,
    canReview,
    onDelete: deleteHandler,
    onView: openReviewSheet,
  });

  return (
    <>
      <DataTable
        data={tableData}
        columns={columns}
        title={title}
        actions={actions}
      />

      <EmployeeDocumentReviewSheet
        document={activeDocument}
        open={reviewSheetOpen}
        canReview={canReview}
        isSubmitting={isReviewing}
        onOpenChange={(open) => {
          setReviewSheetOpen(open);
          if (!open) {
            setActiveDocument(null);
          }
        }}
        onReview={reviewHandler}
      />
    </>
  );
}
