-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'REJECTED', 'APPROVED', 'DEPRECATED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstname" VARCHAR(50),
    "lastname" VARCHAR(50),
    "email" VARCHAR(50),
    "address" VARCHAR(255) NOT NULL,
    "signature" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255),
    "country" VARCHAR(50),
    "phone" VARCHAR(50) NOT NULL,
    "linkedin" VARCHAR(60),
    "discord" VARCHAR(60),
    "facebook" VARCHAR(60),
    "twitter" VARCHAR(60),
    "score" INTEGER NOT NULL DEFAULT 0,
    "about" TEXT,
    "slug" VARCHAR(50),
    "createdAt" TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "teacher_user_id" UUID NOT NULL,
    "publish_status" "Status",
    "name" TEXT,
    "description" TEXT,
    "difficulty" TEXT,
    "video" TEXT,
    "logo" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCoursesMapping" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "UserCoursesMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLectureMapping" (
    "id" SERIAL NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "user_courses_mapping_id" INTEGER NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL DEFAULT -1,

    CONSTRAINT "UserLectureMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lecture" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "video_path" VARCHAR(50),
    "course_id" INTEGER NOT NULL,
    "pre_note" TEXT,
    "next_note" TEXT,
    "picture" VARCHAR(60),

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "score" INTEGER,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(150) NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- AddForeignKey
ALTER TABLE "UserCoursesMapping" ADD CONSTRAINT "UserCoursesMapping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCoursesMapping" ADD CONSTRAINT "UserCoursesMapping_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLectureMapping" ADD CONSTRAINT "UserLectureMapping_user_courses_mapping_id_fkey" FOREIGN KEY ("user_courses_mapping_id") REFERENCES "UserCoursesMapping"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLectureMapping" ADD CONSTRAINT "UserLectureMapping_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "Lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "Lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
