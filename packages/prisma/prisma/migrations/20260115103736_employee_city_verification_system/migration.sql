/*
  Warnings:

  - Added the required column `propertyCity` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "assignedCities" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "propertyCity" TEXT NOT NULL,
ADD COLUMN     "verificationPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "PropertyVerification" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "verificationPhotos" TEXT[],
    "verificationNotes" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PropertyVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyVerification_propertyId_idx" ON "PropertyVerification"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyVerification_verifiedBy_idx" ON "PropertyVerification"("verifiedBy");

-- CreateIndex
CREATE INDEX "PropertyVerification_verifiedAt_idx" ON "PropertyVerification"("verifiedAt");

-- CreateIndex
CREATE INDEX "PropertyVerification_validUntil_idx" ON "PropertyVerification"("validUntil");

-- CreateIndex
CREATE INDEX "PropertyVerification_isActive_idx" ON "PropertyVerification"("isActive");

-- CreateIndex
CREATE INDEX "VerificationRequest_propertyCity_idx" ON "VerificationRequest"("propertyCity");

-- CreateIndex
CREATE INDEX "VerificationRequest_assignedTo_idx" ON "VerificationRequest"("assignedTo");

-- AddForeignKey
ALTER TABLE "PropertyVerification" ADD CONSTRAINT "PropertyVerification_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
