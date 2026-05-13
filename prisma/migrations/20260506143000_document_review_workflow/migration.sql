CREATE TYPE "DocumentReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "EmployeeDocument"
ADD COLUMN "reviewStatus" "DocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "reviewRemark" TEXT,
ADD COLUMN "reviewedById" UUID,
ADD COLUMN "reviewedAt" TIMESTAMP(3);

ALTER TABLE "EmployeeDocument"
ADD CONSTRAINT "EmployeeDocument_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "EmployeeDocument_reviewStatus_idx" ON "EmployeeDocument"("reviewStatus");
