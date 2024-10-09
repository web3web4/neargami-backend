import { IQuestion } from "./question.interface";

export interface IAnswer {
  id: bigint;
  description: string;
  is_correct: boolean;
  question_id: bigint;
  question: IQuestion;
}
