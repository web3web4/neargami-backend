import { ArrayMaxSize, ArrayMinSize, IsArray, IsInstance, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateAnswerDto, UpdateAnswerDto } from './answer.dto';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsString()
  description: string;
  @IsNumber()
  sequence?: number;
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  options: CreateAnswerDto[];
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  description?: string;
  @IsNumber()
  @IsOptional()
  sequence?: number;
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  options: UpdateAnswerDto[];
}
