export class CreateQuestionDto {
  description: string;
  lecture_id: bigint;
  sequence?: number;
  score?: number;
  createdAt?: Date;
}

export class UpdateQuestionDto {
  description?: string;
  lecture_id?: bigint;
  sequence?: number;
  score?: number;
}
