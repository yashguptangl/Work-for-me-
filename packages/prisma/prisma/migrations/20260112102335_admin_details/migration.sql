/*
  Warnings:

  - You are about to drop the `TempMobileVerifyOwnerListing` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('VERIFY_PROPERTIES', 'MANAGE_USERS', 'MANAGE_OWNERS', 'EDIT_PROPERTIES', 'VIEW_ANALYTICS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AdminAction" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VERIFY', 'APPROVE', 'REJECT', 'ASSIGN', 'REVOKE', 'VIEW');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "assignedBy" TEXT,
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "TempMobileVerifyOwnerListing";

-- CreateTable
CREATE TABLE "AdminAssignment" (
    "id" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "taskType" "TaskType" NOT NULL,
    "permissions" TEXT[],
    "description" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AdminAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActivity" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAssignment_assignedTo_idx" ON "AdminAssignment"("assignedTo");

-- CreateIndex
CREATE INDEX "AdminAssignment_assignedBy_idx" ON "AdminAssignment"("assignedBy");

-- CreateIndex
CREATE INDEX "AdminAssignment_status_idx" ON "AdminAssignment"("status");

-- CreateIndex
CREATE INDEX "AdminActivity_adminId_idx" ON "AdminActivity"("adminId");

-- CreateIndex
CREATE INDEX "AdminActivity_action_idx" ON "AdminActivity"("action");

-- CreateIndex
CREATE INDEX "AdminActivity_createdAt_idx" ON "AdminActivity"("createdAt");

-- AddForeignKey
ALTER TABLE "AdminAssignment" ADD CONSTRAINT "AdminAssignment_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAssignment" ADD CONSTRAINT "AdminAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActivity" ADD CONSTRAINT "AdminActivity_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
