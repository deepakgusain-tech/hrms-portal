export const DOCUMENT_REVIEW_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export type DocumentReviewStatus =
  (typeof DOCUMENT_REVIEW_STATUSES)[number];
