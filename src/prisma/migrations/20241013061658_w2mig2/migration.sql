/*
  Warnings:

  - Made the column `score` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "createdAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "name" VARCHAR(150);

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "score" SET DEFAULT 500;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" VARCHAR(255);
