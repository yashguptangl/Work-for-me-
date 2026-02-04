-- CreateTable
CREATE TABLE "RentAgreement" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "creatorPhone" TEXT NOT NULL,
    "creatorUserId" TEXT,
    "ownerFullName" TEXT NOT NULL,
    "ownerPhone" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "tenantFullName" TEXT NOT NULL,
    "tenantPhone" TEXT NOT NULL,
    "tenantPermanentAddress" TEXT NOT NULL,
    "propertyAddress" TEXT NOT NULL,
    "annexures" TEXT,
    "rentAmount" TEXT NOT NULL,
    "securityDeposit" TEXT NOT NULL,
    "agreementDuration" TEXT NOT NULL,
    "noticePeriod" TEXT NOT NULL,
    "rentStartDate" TIMESTAMP(3) NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentAmount" TEXT,
    "paymentDate" TIMESTAMP(3),
    "paymentId" TEXT,
    "documentGenerated" BOOLEAN NOT NULL DEFAULT false,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RentAgreement_creatorPhone_idx" ON "RentAgreement"("creatorPhone");

-- CreateIndex
CREATE INDEX "RentAgreement_creatorUserId_idx" ON "RentAgreement"("creatorUserId");

-- CreateIndex
CREATE INDEX "RentAgreement_ownerPhone_idx" ON "RentAgreement"("ownerPhone");

-- CreateIndex
CREATE INDEX "RentAgreement_tenantPhone_idx" ON "RentAgreement"("tenantPhone");

-- CreateIndex
CREATE INDEX "RentAgreement_createdAt_idx" ON "RentAgreement"("createdAt");

-- CreateIndex
CREATE INDEX "RentAgreement_paymentStatus_idx" ON "RentAgreement"("paymentStatus");
