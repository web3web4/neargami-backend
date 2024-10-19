/*
  Warnings:

  - Added the required column `course_id` to the `UserLectureMapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserLectureMapping" ADD COLUMN     "course_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserLectureMapping" ADD CONSTRAINT "UserLectureMapping_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
