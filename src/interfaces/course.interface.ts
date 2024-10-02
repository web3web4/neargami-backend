/* eslint-disable prettier/prettier */
import { ILecture } from '../interfaces/lecture.interface';
import { IUserCoursesMapping } from '../interfaces/user-courses-mapping.interface';
import { Status } from '@/dtos/course.dto';

export interface ICourse {
  id: bigint;
  title: string;
  teacher_user_id: string;

  publish_status?: Status;
  lectures?: ILecture[];
  userCourses?: IUserCoursesMapping[];
}
