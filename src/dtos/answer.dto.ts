import { IsBoolean, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  description: string;
  @IsBoolean()
  is_correct: boolean;
}

export class UpdateAnswerDto {
  description?: string;
  is_correct?: boolean;
  question_id?: number;
}
