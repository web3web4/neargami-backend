/*
  Warnings:

  - You are about to drop the column `score` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "score",
ADD COLUMN     "ngc" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "top_points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Claims" (
    "id" SERIAL NOT NULL,
    "ngc_claimed" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Claims_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Claims" ADD CONSTRAINT "Claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
