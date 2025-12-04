-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "renderingFiles" TEXT[],
ADD COLUMN     "renderingText" TEXT;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "comment" TEXT;

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "mimetype" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_hash_key" ON "File"("hash");
