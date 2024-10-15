import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';
import { CreateAnswerDto } from './answer.dto';

export class CreateQuestionDto {
  @IsString()
  description: string;
  @IsString()
  @IsOptional()
  sequence?: number;
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  options: CreateAnswerDto[];
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  sequence?: number;
}
