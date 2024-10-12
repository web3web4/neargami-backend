import { ICourse } from './course.interface';
import { IQuestion } from '../interfaces/question.interface';
import { IUserLectureMapping } from '../interfaces/user-lecture-mapping.interface';

export interface ILecture {
  id: bigint;
  title: string;
  name: string;
  description: string;
  video_path?: string;
  course_id: bigint;
  pre_note?: string;
  next_note?: string;
  picture?: string;
  course: ICourse;
  question: IQuestion[];
  userLecture: IUserLectureMapping[];
  deletedAt?: Date;
}
