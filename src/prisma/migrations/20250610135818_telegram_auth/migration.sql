/*
  Warnings:

  - A unique constraint covering the columns `[telegramId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photoUrl" VARCHAR(255),
ADD COLUMN     "telegramId" VARCHAR(255),
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "signature" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
