-- CreateIndex
CREATE INDEX "Course_title_idx" ON "Course" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Course_description_idx" ON "Course" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Lecture_title_idx" ON "Lecture" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Lecture_description_idx" ON "Lecture" USING GIN ("description" gin_trgm_ops);
