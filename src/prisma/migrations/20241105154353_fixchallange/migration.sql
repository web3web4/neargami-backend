/*
  Warnings:

  - You are about to drop the column `message` on the `challangelog` table. All the data in the column will be lost.
  - You are about to drop the column `nonce` on the `challangelog` table. All the data in the column will be lost.
  - You are about to drop the column `publickey` on the `challangelog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "challangelog" DROP COLUMN "message",
DROP COLUMN "nonce",
DROP COLUMN "publickey";
