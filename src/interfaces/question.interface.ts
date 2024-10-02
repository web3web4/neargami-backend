import { ILecture } from "../interfaces/lecture.interface";
import { IAnswer } from "../interfaces/answer.interface";

export interface IQuestion {
  id: bigint;
  description: string;
  lecture_id: number;
  sequence?: number;
  score?: number;
  lecture: ILecture;
  answer: IAnswer[];
}
