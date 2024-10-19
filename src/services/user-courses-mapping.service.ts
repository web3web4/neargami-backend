import { PrismaClient, UserCoursesMapping } from '@prisma/client';
import { CreateUserCoursesMappingDto, UpdateUserCoursesMappingDto } from '../dtos/user-courses-mapping.dto';
import { IUserCoursesMapping } from '../interfaces/user-courses-mapping.interface';
import Container, { Service } from 'typedi';
import { CourseService } from './course.service';

@Service()
export class UserCoursesMappingService {
  public prisma = new PrismaClient();
  public course = Container.get(CourseService);
  async register(user_id: string, course_id: number): Promise<UserCoursesMapping> {
    await this.course.findOne(course_id);
    return this.prisma.userCoursesMapping.create({ data: { user_id, course_id }, include: { course: true } });
  }

  async findAll(user_id: string): Promise<UserCoursesMapping[]> {
    return this.prisma.userCoursesMapping.findMany({ where: { user_id }, include: { user: true, course: true } });
  }

  // async findOne(id: bigint): Promise<IUserCoursesMapping | null> {
  //   return this.prisma.userCoursesMapping.findUnique({ where: { id }, include: { user: true, course: true, userLecture: true } });
  // }

  // async update(id: bigint, data: UpdateUserCoursesMappingDto): Promise<IUserCoursesMapping> {
  //   return this.prisma.userCoursesMapping.update({
  //     where: { id },
  //     data,
  //   });
  // }

  // async delete(id: bigint): Promise<IUserCoursesMapping> {
  //   return this.prisma.userCoursesMapping.delete({ where: { id } });
  // }
}
