-- AddForeignKey
ALTER TABLE "PropertyVerification" ADD CONSTRAINT "PropertyVerification_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
