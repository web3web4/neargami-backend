/*
  Warnings:

  - You are about to drop the column `user_courses_mapping_id` on the `UserLectureMapping` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `UserLectureMapping` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserLectureMapping" DROP CONSTRAINT "UserLectureMapping_user_courses_mapping_id_fkey";

-- AlterTable
ALTER TABLE "UserLectureMapping" DROP COLUMN "user_courses_mapping_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "start_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "end_at" DROP NOT NULL,
ALTER COLUMN "score" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "UserLectureMapping" ADD CONSTRAINT "UserLectureMapping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
