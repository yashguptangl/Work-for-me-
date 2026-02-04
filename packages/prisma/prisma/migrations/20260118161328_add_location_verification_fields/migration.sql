-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "locationCapturedAt" TIMESTAMP(3),
ADD COLUMN     "verificationAddress" TEXT,
ADD COLUMN     "verificationLatitude" DOUBLE PRECISION,
ADD COLUMN     "verificationLongitude" DOUBLE PRECISION,
ALTER COLUMN "amount" SET DEFAULT 299;
