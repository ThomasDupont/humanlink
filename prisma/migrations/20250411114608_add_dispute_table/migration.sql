-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('pending', 'rejected', 'fullRefund', 'partialRefund');

-- CreateTable
CREATE TABLE "Dispute" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "decision" "Decision" NOT NULL,
    "decisionAt" TIMESTAMP(3),
    "decisionComment" TEXT,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("offerId","userId","decision")
);
