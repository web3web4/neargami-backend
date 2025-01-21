/*
  Warnings:

  - The `flags` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "flags",
ADD COLUMN     "flags" JSONB NOT NULL DEFAULT '{"new_user":true,"first_request_approved_courses":false}';
