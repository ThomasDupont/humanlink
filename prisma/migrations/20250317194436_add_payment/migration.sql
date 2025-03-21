/*
  Warnings:

  - Added the required column `amount` to the `UserBalanceEventsLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `UserBalanceEventsLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from` to the `UserBalanceEventsLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromId` to the `UserBalanceEventsLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `UserBalanceEventsLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerPaymentId` to the `UserBalanceEventsLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentEventType" AS ENUM ('payout', 'pre_payment', 'payment', 'invoicing');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('stripe');

-- CreateEnum
CREATE TYPE "PaymentFrom" AS ENUM ('offer', 'milestone');

-- AlterTable
ALTER TABLE "UserBalance" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserBalanceEventsLog" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "eventType" "PaymentEventType" NOT NULL,
ADD COLUMN     "from" "PaymentFrom" NOT NULL,
ADD COLUMN     "fromId" INTEGER NOT NULL,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL,
ADD COLUMN     "providerPaymentId" TEXT NOT NULL;
