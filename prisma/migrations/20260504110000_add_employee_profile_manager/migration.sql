ALTER TABLE "EmployeeProfile"
ADD COLUMN "managerId" UUID;

CREATE INDEX "EmployeeProfile_managerId_idx" ON "EmployeeProfile"("managerId");

ALTER TABLE "EmployeeProfile"
ADD CONSTRAINT "EmployeeProfile_managerId_fkey"
FOREIGN KEY ("managerId") REFERENCES "EmployeeProfile"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
