/*
  Warnings:

  - The values [VERIFY,APPROVE,REJECT,ASSIGN,REVOKE] on the enum `AdminAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdminAction_new" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'BULK_UPDATE', 'VERIFY_PROPERTY', 'APPROVE_VERIFICATION', 'REJECT_VERIFICATION', 'CREATE_EMPLOYEE', 'UPDATE_EMPLOYEE_PERMISSIONS', 'DEACTIVATE_EMPLOYEE', 'ACTIVATE_EMPLOYEE', 'ASSIGN_TASK', 'REVOKE_TASK', 'UPDATE_USER', 'DELETE_USER', 'VERIFY_USER', 'BLOCK_USER', 'UNBLOCK_USER', 'UPDATE_OWNER', 'DELETE_OWNER', 'VERIFY_OWNER', 'BLOCK_OWNER', 'UNBLOCK_OWNER', 'CHANGE_PLAN', 'UPDATE_PROPERTY', 'DELETE_PROPERTY', 'FEATURE_PROPERTY', 'UNFEATURE_PROPERTY', 'EXPORT_DATA', 'IMPORT_DATA', 'SYSTEM_CONFIG');
ALTER TABLE "AdminActivity" ALTER COLUMN "action" TYPE "AdminAction_new" USING ("action"::text::"AdminAction_new");
ALTER TYPE "AdminAction" RENAME TO "AdminAction_old";
ALTER TYPE "AdminAction_new" RENAME TO "AdminAction";
DROP TYPE "AdminAction_old";
COMMIT;

-- AlterTable
ALTER TABLE "AdminActivity" ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "AdminActivity_targetType_idx" ON "AdminActivity"("targetType");

-- CreateIndex
CREATE INDEX "AdminActivity_targetId_idx" ON "AdminActivity"("targetId");
