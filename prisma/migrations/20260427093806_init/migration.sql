-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('TRANSFER', 'PROMOTION', 'TRANSFER_PROMOTION');

-- CreateEnum
CREATE TYPE "ExperienceType" AS ENUM ('FRESHER', 'EXPERIENCED');

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyName" TEXT NOT NULL,
    "companyCode" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "address" TEXT,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyId" UUID NOT NULL,
    "employerName" TEXT NOT NULL,
    "employerCode" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "designation" TEXT,
    "address" TEXT,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRole" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "JobRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkLocation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferPromotion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "fromLocationId" UUID,
    "toLocationId" UUID,
    "currentDesignation" TEXT,
    "newDesignation" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "aadhaarNumber" TEXT NOT NULL,
    "aadhaarFileUrl" TEXT,
    "panNumber" TEXT NOT NULL,
    "panFileUrl" TEXT,
    "educationEntries" JSONB,
    "experienceType" "ExperienceType" NOT NULL DEFAULT 'FRESHER',
    "experienceEntries" JSONB,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID,
    "employeeName" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "companyId" UUID,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "departmentId" UUID,
    "jobRoleId" UUID,
    "workLocationId" UUID,
    "address" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "remark" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleModule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "roleId" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RoleModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyName_key" ON "Company"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "Company_companyCode_key" ON "Company"("companyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Company_email_key" ON "Company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_employerCode_key" ON "Employer"("employerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_email_key" ON "Employer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_name_key" ON "JobRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JobRole_code_key" ON "JobRole"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WorkLocation_name_key" ON "WorkLocation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkLocation_code_key" ON "WorkLocation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_employeeId_key" ON "EmployeeProfile"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_employeeCode_key" ON "EmployeeProfile"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "module_name_idx" ON "Module"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Module_route_key" ON "Module"("route");

-- CreateIndex
CREATE UNIQUE INDEX "RoleModule_roleId_moduleId_key" ON "RoleModule"("roleId", "moduleId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employer" ADD CONSTRAINT "Employer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPromotion" ADD CONSTRAINT "TransferPromotion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPromotion" ADD CONSTRAINT "TransferPromotion_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "WorkLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPromotion" ADD CONSTRAINT "TransferPromotion_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "WorkLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "EmployeeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_workLocationId_fkey" FOREIGN KEY ("workLocationId") REFERENCES "WorkLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleModule" ADD CONSTRAINT "RoleModule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleModule" ADD CONSTRAINT "RoleModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
