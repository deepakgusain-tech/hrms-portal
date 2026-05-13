/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `EmployeeProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `EmployeeProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_createdById_fkey";

-- AlterTable
ALTER TABLE "EmployeeProfile" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeProfile_email_key" ON "EmployeeProfile"("email");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
