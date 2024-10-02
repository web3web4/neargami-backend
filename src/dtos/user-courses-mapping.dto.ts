export class CreateUserCoursesMappingDto {
  start_time: Date;
  end_time: Date;
  user_id: string;
  course_id: bigint;
}

export class UpdateUserCoursesMappingDto {
  start_time?: Date;
  end_time?: Date;
  user_id?: string;
  course_id?: bigint;
}
