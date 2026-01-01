-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyType" ADD VALUE 'HOUSE';
ALTER TYPE "PropertyType" ADD VALUE 'VILLA';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "builtUpArea" TEXT,
ADD COLUMN     "carpetArea" TEXT,
ADD COLUMN     "facingDirection" TEXT,
ADD COLUMN     "floorNumber" INTEGER,
ADD COLUMN     "furnishingDetails" TEXT,
ADD COLUMN     "listingType" TEXT NOT NULL DEFAULT 'RENT',
ADD COLUMN     "possession" TEXT,
ADD COLUMN     "pricePerSqft" TEXT,
ADD COLUMN     "propertyAge" TEXT,
ADD COLUMN     "salePrice" TEXT,
ALTER COLUMN "rent" DROP NOT NULL,
ALTER COLUMN "security" DROP NOT NULL,
ALTER COLUMN "maintenance" DROP NOT NULL,
ALTER COLUMN "accommodation" DROP NOT NULL,
ALTER COLUMN "genderPreference" DROP NOT NULL,
ALTER COLUMN "noticePeriod" DROP NOT NULL;
