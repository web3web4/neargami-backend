import { LectureWithRelations } from '../interfaces/lecture.interface';
import { IAnswer } from '../interfaces/answer.interface';

export interface IQuestion {
  id: bigint;
  description: string;
  lecture_id: number;
  sequence?: number;
  score?: number;
  lecture: LectureWithRelations;
  answer: IAnswer[];
}
