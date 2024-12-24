/* eslint-disable prettier/prettier */
import { LectureWithRelations } from '../interfaces/lecture.interface';
import { IUserCoursesMapping } from '../interfaces/user-courses-mapping.interface';
import { Status } from '@/dtos/course.dto';

export interface ICourse {
  icoursewithoutUserId: ICoursewithoutUserId;
  teacher_user_id: string;
}
export interface ICoursewithoutUserId {
  id: bigint;
  title: string;
  publish_status?: Status;
  name?: string;
  description?: string;
  difficulty?: string;
  video?: string;
  logo?: string;
  lectures?: LectureWithRelations[];
  userCourses?: IUserCoursesMapping[];
}

export interface ICoursefull {
  id: bigint;
  title: string;
  publish_status?: Status;
  name?: string;
  description?: string;
  difficulty?: string;
  video?: string;
  logo?: string;
  lectures?: LectureWithRelations[];
  userCourses?: IUserCoursesMapping[];
  teacher_user_id: string;
}
