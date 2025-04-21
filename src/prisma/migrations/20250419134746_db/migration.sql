-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'REJECTED', 'APPROVED', 'DEPRECATED');

-- CreateTable
CREATE TABLE "Challangelog" (
    "id" SERIAL NOT NULL,
    "accountId" VARCHAR(255),
    "challange" VARCHAR(255),
    "signature" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challangelog_pkey" PRIMARY KEY ("id")
);

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
    "phone" VARCHAR(50),
    "linkedin" VARCHAR(60),
    "discord" VARCHAR(60),
    "facebook" VARCHAR(60),
    "twitter" VARCHAR(60),
    "ngc" INTEGER NOT NULL DEFAULT 0,
    "top_points" INTEGER NOT NULL DEFAULT 0,
    "about" TEXT,
    "slug" VARCHAR(50),
    "createdAt" TIMESTAMP,
    "image" TEXT,
    "game" JSONB,
    "gameScreenshot" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "flags" JSONB NOT NULL DEFAULT '{"new_user":true,"first_request_approved_courses":false,"email_notification":false}',
    "username" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claims" (
    "id" SERIAL NOT NULL,
    "ngc_claimed" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "parent_version_id" INTEGER,
    "title" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(250),
    "teacher_user_id" UUID NOT NULL,
    "publish_status" "Status",
    "name" TEXT,
    "description" TEXT,
    "difficulty" TEXT,
    "video" TEXT,
    "logo" TEXT,
    "tag" TEXT,
    "language" TEXT NOT NULL DEFAULT 'english',
    "version" DOUBLE PRECISION,
    "whats_new" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseStatusLog" (
    "id" SERIAL NOT NULL,
    "last_publish_status" "Status",
    "current_publish_status" "Status",
    "changeStatusDate" TIMESTAMP,
    "changeStatusReson" TEXT,
    "course_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCoursesMapping" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "user_id" UUID NOT NULL,
    "course_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCoursesMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLectureMapping" (
    "id" SERIAL NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" INTEGER NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMP(3),
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLectureMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lecture" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(250),
    "description" TEXT NOT NULL,
    "video_path" VARCHAR(50),
    "course_id" INTEGER NOT NULL,
    "pre_note" TEXT,
    "next_note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "picture" VARCHAR(60),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "sequence" INTEGER,
    "score" INTEGER DEFAULT 10,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(150) NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestionAnswer" (
    "id" SERIAL NOT NULL,
    "student_id" UUID NOT NULL,
    "course_id" INTEGER NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" SERIAL NOT NULL,
    "query" TEXT[],
    "keyword" VARCHAR(50) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courseStatusHistoryForAdmin" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" INTEGER NOT NULL,
    "prev_status" "Status",
    "new_status" "Status" NOT NULL,
    "create_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courseStatusHistoryForAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" SERIAL NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stack" TEXT,
    "context" JSONB,
    "userId" INTEGER,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");

-- CreateIndex
CREATE UNIQUE INDEX "SearchQuery_keyword_key" ON "SearchQuery"("keyword");

-- CreateIndex
CREATE INDEX "Log_level_idx" ON "Log"("level");

-- CreateIndex
CREATE INDEX "Log_timestamp_idx" ON "Log"("timestamp");

-- AddForeignKey
ALTER TABLE "Claims" ADD CONSTRAINT "Claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseStatusLog" ADD CONSTRAINT "CourseStatusLog_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCoursesMapping" ADD CONSTRAINT "UserCoursesMapping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCoursesMapping" ADD CONSTRAINT "UserCoursesMapping_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLectureMapping" ADD CONSTRAINT "UserLectureMapping_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLectureMapping" ADD CONSTRAINT "UserLectureMapping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLectureMapping" ADD CONSTRAINT "UserLectureMapping_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "Lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "Lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "Lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseStatusHistoryForAdmin" ADD CONSTRAINT "courseStatusHistoryForAdmin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseStatusHistoryForAdmin" ADD CONSTRAINT "courseStatusHistoryForAdmin_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
