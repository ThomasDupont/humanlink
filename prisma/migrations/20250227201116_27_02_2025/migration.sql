-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
ALTER TYPE "Country" ADD VALUE 'USA';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" "Role"[];
