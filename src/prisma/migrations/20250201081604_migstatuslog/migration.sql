-- CreateTable
CREATE TABLE "courseStatusHistoryForAdmin" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" INTEGER NOT NULL,
    "prev_status" "Status",
    "new_status" "Status" NOT NULL,
    "create_at" TIMESTAMP NOT NULL,

    CONSTRAINT "courseStatusHistoryForAdmin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "courseStatusHistoryForAdmin" ADD CONSTRAINT "courseStatusHistoryForAdmin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseStatusHistoryForAdmin" ADD CONSTRAINT "courseStatusHistoryForAdmin_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
