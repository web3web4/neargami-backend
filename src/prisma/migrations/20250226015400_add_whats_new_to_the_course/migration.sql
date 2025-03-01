/*
  Warnings:

  - You are about to drop the `Log` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "whats_new" TEXT;

-- DropTable
DROP TABLE "Log";
