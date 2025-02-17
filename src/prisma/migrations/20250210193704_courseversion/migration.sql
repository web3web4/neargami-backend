-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "parent_version_id" INTEGER,
ADD COLUMN     "version" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
