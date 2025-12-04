-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "userIdReceiver" INTEGER;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_userIdReceiver_fkey" FOREIGN KEY ("userIdReceiver") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
