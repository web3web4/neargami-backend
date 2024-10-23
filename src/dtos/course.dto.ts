/* eslint-disable prettier/prettier */
import { ICoursewithoutUserId } from '@/interfaces/course.interface';
import { IsEmpty, IsEnum, IsOptional, IsString, IsUUID, Max, MaxLength } from 'class-validator';

export enum Status {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  DEPRECATED = 'DEPRECATED',
}
export class CreateCourseDto {
  @IsString()
  @MaxLength(50)
  public name: string;
  @IsString()
  @MaxLength(150)
  public title: string;
  @IsString()
  public logo: string;
  @IsString()
  public description: string;
  @IsString()
  @MaxLength(10)
  public difficulty: string;
 @IsEmpty()
  public tag?: string;
}

export class UpdateCourseDto {
  @IsString()
  @MaxLength(150)
  @IsOptional()
  public title?: string;
  @IsOptional()
  @IsEnum(Status)
  public publish_status?: Status;
  @IsString()
  @MaxLength(50)
  @IsOptional()
  public name?: string;
  @IsString()
  @IsOptional()
  public description?: string;
  @IsString()
  @IsOptional()
  public difficulty?: string;
  @IsString()
  @IsOptional()
  public video?: string;
  @IsString()
  @IsOptional()
  public logo?: string;
  @IsString()
  @MaxLength(150)
  public tag?: string;
}
