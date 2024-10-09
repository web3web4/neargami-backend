export class CreateLectureDto {
  title: string;
  description: string;
  video_path?: string;
  course_id: number;
  pre_note?: string;
  next_note?: string;
  picture?: string;
}

export class UpdateLectureDto {
  title?: string;
  description?: string;
  video_path?: string;
  course_id?: number;
  pre_note?: string;
  next_note?: string;
  picture?: string;
}
