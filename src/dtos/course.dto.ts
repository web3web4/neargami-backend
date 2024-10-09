/* eslint-disable prettier/prettier */
import { ICoursewithoutUserId } from '@/interfaces/course.interface';
import { IsUUID } from 'class-validator';


export enum Status {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  DEPRECATED = 'DEPRECATED',
}
export class CreateCourseDto {
  

  icoursewithoutUserId: ICoursewithoutUserId;
  @IsUUID()
  teacher_user_id: string;

}

export class UpdateCourseDto {
  title?: string;
  teacher_user_id?: string;
  publish_status?: Status;
  name?: string;
  description?: string;
  difficulty     ?:string;
  video          ?:string;
   logo          ?:string;
}
