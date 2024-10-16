import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateLectureDto {
  @IsString()
  @MaxLength(150)
  public title: string;
  @IsString()
  public description: string;
  @IsNumber()
  public order: number;
  @IsString()
  @IsOptional()
  public video_path?: string;
  @IsString()
  @IsOptional()
  public pre_note?: string;
  @IsString()
  @IsOptional()
  public next_note?: string;
  @IsString()
  @IsOptional()
  public picture?: string;
}

export class UpdateLectureDto {
  @IsString()
  @MaxLength(150)
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsNumber()
  @IsOptional()
  public order?: number;
  @IsString()
  @IsOptional()
  video_path?: string;
  @IsString()
  @IsOptional()
  pre_note?: string;
  @IsString()
  @IsOptional()
  next_note?: string;
  @IsString()
  @IsOptional()
  picture?: string;
}
export class UpdateLectureOrderDto {
  @IsNumber()
  id: number;
  @IsNumber()
  order: number;
}
export class UpdateLectureOrderArrayDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLectureOrderDto)
  public orders: UpdateLectureOrderDto[];
}
