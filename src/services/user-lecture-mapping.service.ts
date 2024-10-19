import { PrismaClient, UserLectureMapping } from '@prisma/client';
import { CreateUserLectureMappingDto, UpdateUserLectureMappingDto } from '../dtos/user-lecture-mapping.dto';
import { IUserLectureMapping } from '../interfaces/user-lecture-mapping.interface';
import Container, { Service } from 'typedi';
import { LectureService } from './lecture.service';

@Service()
export class UserLectureMappingService {
  public prisma = new PrismaClient();
  public lecture = Container.get(LectureService);
  async register(user_id: string, course_id: number, lecture_id: number): Promise<UserLectureMapping> {
    await this.lecture.findOne(lecture_id, course_id);
    return this.prisma.userLectureMapping.create({ data: { user_id, lecture_id, course_id }, include: { lecture: true } });
  }

  async findAll(user_id: string, course_id: number): Promise<UserLectureMapping[]> {
    return this.prisma.userLectureMapping.findMany({ where: { AND: { user_id, course_id } }, include: { lecture: true } });
  }

  // async findOne(id: bigint): Promise<IUserLectureMapping | null> {
  //   return this.prisma.userLectureMapping.findUnique({ where: { id }, include: { lecture: true, userCoursesMapping: true } });
  // }

  // async update(id: bigint, data: UpdateUserLectureMappingDto): Promise<IUserLectureMapping> {
  //   return this.prisma.userLectureMapping.update({
  //     where: { id },
  //     data,
  //   });
  // }

  // async delete(id: bigint): Promise<IUserLectureMapping> {
  //   return this.prisma.userLectureMapping.delete({ where: { id } });
  // }
}
