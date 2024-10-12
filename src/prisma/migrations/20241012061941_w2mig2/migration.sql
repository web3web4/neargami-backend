/*
  Warnings:

  - Added the required column `name` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "name" VARCHAR(50) NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "address" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "signature" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "message" SET DATA TYPE VARCHAR(255);
