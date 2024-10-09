import { ILecture } from "./lecture.interface";
import { IUserCoursesMapping } from "./user-courses-mapping.interface";

export interface IUserLectureMapping {
  id: bigint;
  lecture_id: bigint;
  user_courses_mapping_id: bigint;
  start_at: Date;
  end_at: Date;
  score: number;
  lecture: ILecture;
  userCoursesMapping: IUserCoursesMapping;
}
