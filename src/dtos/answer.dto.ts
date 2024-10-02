export class CreateAnswerDto {
  description: string;
  is_correct: boolean;
  question_id: number;
}

export class UpdateAnswerDto {
  description?: string;
  is_correct?: boolean;
  question_id?: number;
}
