/*
  Warnings:

  - You are about to drop the column `publick_key` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[public_key]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `public_key` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_publick_key_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "publick_key",
ADD COLUMN     "public_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_public_key_key" ON "User"("public_key");
