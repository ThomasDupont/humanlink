/*
  Warnings:

  - Added the required column `country` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Country" AS ENUM ('France', 'Germany', 'UnitedKingdom', 'Spain', 'Italy');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" "Country" NOT NULL;
