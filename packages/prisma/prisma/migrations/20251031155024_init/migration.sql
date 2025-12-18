-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SEEKER', 'OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('ROOM', 'PG', 'FLAT', 'PLOT');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('INQUIRY', 'CALL_REQUEST', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SEEKER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otp" INTEGER,
    "planType" TEXT DEFAULT 'FREE',
    "listings" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "otp" INTEGER,
    "planType" TEXT DEFAULT 'FREE',
    "validity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listings" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "townSector" TEXT,
    "colony" TEXT,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "apiAddress" TEXT,
    "rent" TEXT NOT NULL,
    "security" TEXT NOT NULL DEFAULT '0',
    "maintenance" TEXT NOT NULL DEFAULT '0',
    "negotiable" BOOLEAN NOT NULL DEFAULT false,
    "bhk" INTEGER NOT NULL DEFAULT 1,
    "furnished" TEXT NOT NULL,
    "accommodation" TEXT NOT NULL,
    "totalFloors" INTEGER NOT NULL DEFAULT 1,
    "totalUnits" INTEGER NOT NULL DEFAULT 1,
    "powerBackup" TEXT NOT NULL,
    "waterSupply" TEXT NOT NULL,
    "parking" TEXT NOT NULL,
    "insideAmenities" TEXT[],
    "outsideAmenities" TEXT[],
    "genderPreference" TEXT NOT NULL,
    "preferredTenants" TEXT[],
    "noticePeriod" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "whatsappNo" TEXT NOT NULL,
    "images" TEXT[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userPhone" TEXT NOT NULL,
    "message" TEXT,
    "contactType" "ContactType" NOT NULL DEFAULT 'INQUIRY',
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "ownerDeleted" BOOLEAN NOT NULL DEFAULT false,
    "userDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempMobileVerifyOwnerListing" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempMobileVerifyOwnerListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempMobileVerification" (
    "id" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempMobileVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_email_key" ON "Owner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_phone_key" ON "Owner"("phone");

-- CreateIndex
CREATE INDEX "Owner_email_idx" ON "Owner"("email");

-- CreateIndex
CREATE INDEX "Owner_phone_idx" ON "Owner"("phone");

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "Property"("city");

-- CreateIndex
CREATE INDEX "Property_propertyType_idx" ON "Property"("propertyType");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "Property_isAvailable_idx" ON "Property"("isAvailable");

-- CreateIndex
CREATE INDEX "Property_isDraft_idx" ON "Property"("isDraft");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "Property"("createdAt");

-- CreateIndex
CREATE INDEX "Contact_propertyId_idx" ON "Contact"("propertyId");

-- CreateIndex
CREATE INDEX "Contact_userPhone_idx" ON "Contact"("userPhone");

-- CreateIndex
CREATE INDEX "Contact_createdAt_idx" ON "Contact"("createdAt");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_propertyId_idx" ON "Wishlist"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_propertyId_key" ON "Wishlist"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "TempMobileVerifyOwnerListing_mobile_idx" ON "TempMobileVerifyOwnerListing"("mobile");

-- CreateIndex
CREATE INDEX "TempMobileVerifyOwnerListing_expiresAt_idx" ON "TempMobileVerifyOwnerListing"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TempMobileVerification_mobile_key" ON "TempMobileVerification"("mobile");

-- CreateIndex
CREATE INDEX "TempMobileVerification_mobile_idx" ON "TempMobileVerification"("mobile");

-- CreateIndex
CREATE INDEX "TempMobileVerification_expiresAt_idx" ON "TempMobileVerification"("expiresAt");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
