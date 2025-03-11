-- CreateEnum
CREATE TYPE "OauthProvider" AS ENUM ('google', 'linkedin');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('France', 'Germany', 'UnitedKingdom', 'Spain', 'Italy', 'USA');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('FR', 'EN');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('digital', 'physical');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GraphiqueAndDesign', 'MusicAndAudio', 'OnlineCourse', 'ProgrammingAndTech', 'MarketingAndDigital', 'LegalAdvice', 'OnlineShopManagement', 'Sale', 'CompanyCreation', 'IntellectualProperty', 'Assistance', 'BusinessPlan', 'MarketResearch', 'CorporateConsulting', 'HRConsulting', 'CustomerService', 'SustainableDevelopmentConsulting', 'ProductManagement', 'AIConsulting', 'Events', 'Coaching', 'CopywritingAndTranslation', 'Photography', 'Data', 'Leisure', 'VideoAndAnimation', 'Recruitment', 'DIY', 'Gardening');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('fix', 'percent', 'fixedPerItem');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('EUR', 'USD');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "oauthProvider" "OauthProvider" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "isCertified" BOOLEAN NOT NULL,
    "certifiedDate" TIMESTAMP(3),
    "image" TEXT,
    "country" "Country" NOT NULL,
    "roles" "Role"[],
    "userBalanceId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "descriptionShort" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "langs" "Lang"[],
    "type" "ServiceType" NOT NULL,
    "localisation" TEXT NOT NULL,
    "renewable" BOOLEAN NOT NULL,
    "category" "Category" NOT NULL,
    "images" TEXT[],

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "type" "PriceType" NOT NULL,
    "number" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" INTEGER,
    "receiverId" INTEGER,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "offerId" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    "serviceId" INTEGER,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "isAccepted" BOOLEAN NOT NULL,
    "isPaid" BOOLEAN NOT NULL,
    "paidDate" TIMESTAMP(3),
    "isTerminated" BOOLEAN NOT NULL,
    "terminatedAt" TIMESTAMP(3),

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "offerId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "terminatedAt" TIMESTAMP(3),
    "validatedAt" TIMESTAMP(3),
    "priceMilestoneId" INTEGER NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceMilestone" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "PriceType" NOT NULL,
    "number" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL,
    "baseForPercent" INTEGER,
    "itemCount" INTEGER NOT NULL,

    CONSTRAINT "PriceMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBalance" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBalanceEventsLog" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserBalanceEventsLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_userBalanceId_key" ON "User"("userBalanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_offerId_key" ON "Message"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_priceMilestoneId_key" ON "Milestone"("priceMilestoneId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userBalanceId_fkey" FOREIGN KEY ("userBalanceId") REFERENCES "UserBalance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_priceMilestoneId_fkey" FOREIGN KEY ("priceMilestoneId") REFERENCES "PriceMilestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBalanceEventsLog" ADD CONSTRAINT "UserBalanceEventsLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
