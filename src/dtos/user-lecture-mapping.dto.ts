export class CreateUserLectureMappingDto {

  lecture_id: bigint;
  user_courses_mapping_id: bigint;
  start_at: Date;
  end_at: Date;
  score: number;
}

export class UpdateUserLectureMappingDto {
  lecture_id?: bigint;
  user_courses_mapping_id?: bigint;
  start_at?: Date;
  end_at?: Date;
  score?: number;
}
