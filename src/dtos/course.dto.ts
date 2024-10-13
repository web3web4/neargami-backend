/* eslint-disable prettier/prettier */
import { ICoursewithoutUserId } from '@/interfaces/course.interface';
import { IsEnum, IsString, IsUUID, Max, MaxLength } from 'class-validator';

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
}

export class UpdateCourseDto {
  @IsString()
  @MaxLength(150)
  public title?: string;
  @IsEnum(Status)
  public publish_status?: Status;
  @IsString()
  @MaxLength(50)
  public name?: string;
  @IsString()
  public description?: string;
  @IsString()
  public difficulty?: string;
  @IsString()
  public video?: string;
  @IsString()
  public logo?: string;
}
