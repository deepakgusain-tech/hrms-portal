ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'WFH';
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'OD';
ALTER TYPE "AttendanceStatus" ADD VALUE IF NOT EXISTS 'OUT_OF_STATION';

CREATE TYPE "AttendanceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "AttendanceRequestType" AS ENUM ('HALF_DAY', 'WFH', 'OD', 'OUT_OF_STATION');

CREATE TABLE "AttendanceRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "attendanceId" UUID,
    "requestType" "AttendanceRequestType" NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" "AttendanceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AttendanceRequest_employeeId_idx" ON "AttendanceRequest"("employeeId");
CREATE INDEX "AttendanceRequest_attendanceId_idx" ON "AttendanceRequest"("attendanceId");
CREATE INDEX "AttendanceRequest_status_idx" ON "AttendanceRequest"("status");
CREATE INDEX "AttendanceRequest_requestType_idx" ON "AttendanceRequest"("requestType");

ALTER TABLE "AttendanceRequest"
ADD CONSTRAINT "AttendanceRequest_employeeId_fkey"
FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AttendanceRequest"
ADD CONSTRAINT "AttendanceRequest_attendanceId_fkey"
FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AttendanceRequest"
ADD CONSTRAINT "AttendanceRequest_approvedById_fkey"
FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
