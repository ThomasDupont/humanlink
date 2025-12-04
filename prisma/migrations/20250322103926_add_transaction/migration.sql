-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('acceptOffer', 'transfertToSellerBalance', 'transfertToVendorBalance', 'fees', 'cancelOffer');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" INTEGER,
    "vendorId" INTEGER,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "offerId" INTEGER,
    "milestoneId" INTEGER,
    "comment" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
