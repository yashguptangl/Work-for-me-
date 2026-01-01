-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_VERIFIED', 'PENDING_PAYMENT', 'PENDING_VERIFICATION', 'VERIFIED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VerificationRequestStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_COMPLETED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "verificationExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED',
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 149,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "paymentDate" TIMESTAMP(3),
    "status" "VerificationRequestStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactUs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactUs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VerificationRequest_propertyId_idx" ON "VerificationRequest"("propertyId");

-- CreateIndex
CREATE INDEX "VerificationRequest_ownerId_idx" ON "VerificationRequest"("ownerId");

-- CreateIndex
CREATE INDEX "VerificationRequest_status_idx" ON "VerificationRequest"("status");

-- CreateIndex
CREATE INDEX "VerificationRequest_paymentStatus_idx" ON "VerificationRequest"("paymentStatus");

-- CreateIndex
CREATE INDEX "VerificationRequest_createdAt_idx" ON "VerificationRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContactUs_email_key" ON "ContactUs"("email");

-- CreateIndex
CREATE INDEX "Property_verificationStatus_idx" ON "Property"("verificationStatus");

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
