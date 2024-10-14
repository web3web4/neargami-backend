import { Course, Lecture, Question, UserLectureMapping } from '@prisma/client';

export type LectureWithRelations = Lecture & {
  course: Course;
  question: Question[];
  userLecture: UserLectureMapping[];
};
