ALTER TABLE "User"
ADD COLUMN "resetTokenHash" TEXT,
ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);

ALTER TABLE "EmployeeProfile"
ADD COLUMN "resetTokenHash" TEXT,
ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);

ALTER TABLE "Employer"
ADD COLUMN "resetTokenHash" TEXT,
ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);

ALTER TABLE "Configuration"
ADD COLUMN "smtpHost" TEXT,
ADD COLUMN "smtpPort" INTEGER,
ADD COLUMN "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "smtpFromName" TEXT;

CREATE INDEX "User_resetTokenHash_idx" ON "User"("resetTokenHash");
CREATE INDEX "EmployeeProfile_resetTokenHash_idx" ON "EmployeeProfile"("resetTokenHash");
CREATE INDEX "Employer_resetTokenHash_idx" ON "Employer"("resetTokenHash");
