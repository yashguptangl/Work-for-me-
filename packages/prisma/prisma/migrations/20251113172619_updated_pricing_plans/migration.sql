/*
  Warnings:

  - You are about to drop the column `listings` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `planType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "expiry" TIMESTAMP(3),
ADD COLUMN     "offer" TEXT DEFAULT '',
ADD COLUMN     "type" TEXT DEFAULT 'RENT';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "listings",
DROP COLUMN "planType";
