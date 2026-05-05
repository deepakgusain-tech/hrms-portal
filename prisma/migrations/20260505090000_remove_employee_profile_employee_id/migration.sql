ALTER TABLE "EmployeeProfile" DROP CONSTRAINT "EmployeeProfile_employeeId_fkey";

DROP INDEX "EmployeeProfile_employeeId_key";

ALTER TABLE "EmployeeProfile" DROP COLUMN "employeeId";
