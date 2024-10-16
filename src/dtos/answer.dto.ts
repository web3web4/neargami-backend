import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  description: string;
  @IsBoolean()
  is_correct: boolean;
}

export class UpdateAnswerDto {
  @IsNumber()
  id: number;
  @IsString()
  @IsOptional()
  description?: string;
  @IsBoolean()
  @IsOptional()
  is_correct?: boolean;
}
