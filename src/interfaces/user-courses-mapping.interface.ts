import { IUserLectureMapping } from "../interfaces/user-lecture-mapping.interface";
import { IUser } from "./user.interface";
import { ICourse } from "./course.interface";

export interface IUserCoursesMapping {
  id: bigint;
  start_time: Date;
  end_time: Date;
  user_id: string;
  course_id: bigint;
  user: IUser;
  course: ICourse;
  userLecture: IUserLectureMapping[];
}
