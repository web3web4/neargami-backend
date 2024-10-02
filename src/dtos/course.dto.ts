/* eslint-disable prettier/prettier */
import { IsUUID } from 'class-validator';


export enum Status {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  DEPRECATED = 'DEPRECATED',
}
export class CreateCourseDto {
  title: string;
  @IsUUID()
  teacher_user_id: string;
  publish_status?: Status;
}

export class UpdateCourseDto {
  title?: string;
  teacher_user_id?: string;
  publish_status?: Status;
}
