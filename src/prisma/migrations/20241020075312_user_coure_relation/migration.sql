-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
