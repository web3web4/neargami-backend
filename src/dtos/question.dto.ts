import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  description: string;
  @IsString()
  @IsOptional()
  sequence?: number;
  @IsString()
  @IsOptional()
  score?: number;
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  options: string[];
}

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  sequence?: number;
  @IsString()
  @IsOptional()
  score?: number;
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsOptional()
  options?: string[];
}
