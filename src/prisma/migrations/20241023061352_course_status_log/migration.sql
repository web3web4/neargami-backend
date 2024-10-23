-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "tag" TEXT;

-- CreateTable
CREATE TABLE "CourseStatusLog" (
    "id" SERIAL NOT NULL,
    "last_publish_status" "Status",
    "current_publish_status" "Status",
    "changeStatusDate" TIMESTAMP,
    "changeStatusReson" TEXT,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "CourseStatusLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseStatusLog" ADD CONSTRAINT "CourseStatusLog_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
