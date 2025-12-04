/*
  Warnings:

  - You are about to drop the column `provier` on the `ConnectedAccount` table. All the data in the column will be lost.
  - Added the required column `provider` to the `ConnectedAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConnectedAccount" DROP COLUMN "provier",
ADD COLUMN     "provider" "PaymentProvider" NOT NULL;
