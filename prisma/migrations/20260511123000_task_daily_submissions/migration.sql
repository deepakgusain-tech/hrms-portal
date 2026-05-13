CREATE TABLE "TaskSubmission" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "taskId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "workDate" DATE NOT NULL,
  "summary" TEXT NOT NULL,
  "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "reviewerTag" TEXT NOT NULL,
  "reviewRemark" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TaskSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TaskSubmission_taskId_idx" ON "TaskSubmission"("taskId");
CREATE INDEX "TaskSubmission_employeeId_idx" ON "TaskSubmission"("employeeId");

ALTER TABLE "TaskSubmission"
ADD CONSTRAINT "TaskSubmission_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskSubmission"
ADD CONSTRAINT "TaskSubmission_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
