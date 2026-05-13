CREATE TYPE "EodApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "EodReport" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "attendanceId" UUID,
    "reportDate" DATE NOT NULL,
    "accomplishments" TEXT NOT NULL,
    "plans" TEXT,
    "blockers" TEXT,
    "managerStatus" "EodApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "managerRemark" TEXT,
    "reviewedByManagerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EodReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MonthlyEodReview" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "managerStatus" "EodApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "managerRemark" TEXT,
    "reviewedByManagerId" UUID,
    "hrStatus" "EodApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "hrRemark" TEXT,
    "reviewedByHrEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyEodReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EodReport_employeeId_reportDate_key" ON "EodReport"("employeeId", "reportDate");
CREATE INDEX "EodReport_reportDate_idx" ON "EodReport"("reportDate");
CREATE INDEX "EodReport_managerStatus_idx" ON "EodReport"("managerStatus");

CREATE UNIQUE INDEX "MonthlyEodReview_employeeId_year_month_key" ON "MonthlyEodReview"("employeeId", "year", "month");
CREATE INDEX "MonthlyEodReview_year_month_idx" ON "MonthlyEodReview"("year", "month");
CREATE INDEX "MonthlyEodReview_managerStatus_hrStatus_idx" ON "MonthlyEodReview"("managerStatus", "hrStatus");

ALTER TABLE "EodReport"
ADD CONSTRAINT "EodReport_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EodReport"
ADD CONSTRAINT "EodReport_attendanceId_fkey"
FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EodReport"
ADD CONSTRAINT "EodReport_reviewedByManagerId_fkey"
FOREIGN KEY ("reviewedByManagerId") REFERENCES "EmployeeProfile"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MonthlyEodReview"
ADD CONSTRAINT "MonthlyEodReview_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MonthlyEodReview"
ADD CONSTRAINT "MonthlyEodReview_reviewedByManagerId_fkey"
FOREIGN KEY ("reviewedByManagerId") REFERENCES "EmployeeProfile"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
