import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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
