-- CreateEnum
CREATE TYPE "OauthProvider" AS ENUM ('google', 'linkedin');

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
    "isFreelance" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "isCertified" BOOLEAN NOT NULL,
    "certifiedDate" TIMESTAMP(3),

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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
