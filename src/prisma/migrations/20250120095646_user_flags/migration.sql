-- AlterTable
ALTER TABLE "User" ADD COLUMN     "flags" TEXT NOT NULL DEFAULT '{"new_user":true,"first_request_approved_courses":false}';
