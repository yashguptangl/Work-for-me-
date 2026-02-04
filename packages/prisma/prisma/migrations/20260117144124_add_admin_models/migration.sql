/*
  Warnings:

  - You are about to drop the column `assignedCities` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `permissions` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the `AdminActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdminAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminActivity" DROP CONSTRAINT "AdminActivity_adminId_fkey";

-- DropForeignKey
ALTER TABLE "AdminAssignment" DROP CONSTRAINT "AdminAssignment_assignedBy_fkey";

-- DropForeignKey
ALTER TABLE "AdminAssignment" DROP CONSTRAINT "AdminAssignment_assignedTo_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "assignedCities",
DROP COLUMN "permissions";

-- DropTable
DROP TABLE "AdminActivity";

-- DropTable
DROP TABLE "AdminAssignment";

-- DropEnum
DROP TYPE "AdminAction";

-- DropEnum
DROP TYPE "AssignmentStatus";

-- DropEnum
DROP TYPE "TaskType";

-- CreateTable
CREATE TABLE "EmployeePermission" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "canViewUsers" BOOLEAN NOT NULL DEFAULT false,
    "canViewOwners" BOOLEAN NOT NULL DEFAULT false,
    "canViewProperties" BOOLEAN NOT NULL DEFAULT false,
    "canEditProperties" BOOLEAN NOT NULL DEFAULT false,
    "canVerifyProperties" BOOLEAN NOT NULL DEFAULT false,
    "canHandleUsers" BOOLEAN NOT NULL DEFAULT false,
    "canHandleOwners" BOOLEAN NOT NULL DEFAULT false,
    "canViewDashboard" BOOLEAN NOT NULL DEFAULT true,
    "canViewReports" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActivityLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePermission_adminId_key" ON "EmployeePermission"("adminId");

-- CreateIndex
CREATE INDEX "EmployeePermission_adminId_idx" ON "EmployeePermission"("adminId");

-- CreateIndex
CREATE INDEX "AdminActivityLog_adminId_idx" ON "AdminActivityLog"("adminId");

-- CreateIndex
CREATE INDEX "AdminActivityLog_createdAt_idx" ON "AdminActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminActivityLog_entityType_idx" ON "AdminActivityLog"("entityType");

-- AddForeignKey
ALTER TABLE "EmployeePermission" ADD CONSTRAINT "EmployeePermission_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
