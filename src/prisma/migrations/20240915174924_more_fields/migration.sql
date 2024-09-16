/*
  Warnings:

  - You are about to drop the column `public_key` on the `User` table. All the data in the column will be lost.
  - Added the required column `message` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signature` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_public_key_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "public_key",
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "signature" TEXT NOT NULL;
