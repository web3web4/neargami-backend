import { UserCoursesMapping } from '@prisma/client';
import Container, { Service } from 'typedi';
import { CourseService } from './course.service';
import { HttpException } from '@/exceptions/HttpException';
import { PrismaService } from './prisma.service';

@Service()
export class UserCoursesMappingService {
  private prismaService = Container.get(PrismaService);
  private prisma = this.prismaService.prisma;
  private course = Container.get(CourseService);
  async register(user_id: string, course_id: number): Promise<UserCoursesMapping> {
    await this.course.findOne(course_id);
    return this.prisma.userCoursesMapping.create({ data: { user_id, course_id }, include: { course: true } });
  }

  async finish(user_id: string, course_id: number): Promise<UserCoursesMapping> {
    await this.course.findOne(course_id);
    const userCourse = await this.prisma.userCoursesMapping.findFirst({ where: { AND: { user_id, course_id } } });
    if (!userCourse) {
      throw new HttpException(409, 'Course not registered');
    }
    return this.prisma.userCoursesMapping.update({ where: { id: userCourse.id }, data: { end_time: new Date() } });
  }

  async findAll(user_id: string): Promise<UserCoursesMapping[]> {
    const userCourses = await this.prisma.userCoursesMapping.findMany({
      where: { user_id },
      include: { user: { include: { userLecture: true } }, course: { include: { teacher: true, lecture: { include: { question: true } } } } },
    });
    const result = userCourses.map(courseMapping => {
      const endedLecturesCount = courseMapping.user.userLecture.filter(
        lecture => lecture.end_at !== null && lecture.course_id === courseMapping.course_id,
      ).length;
      const questionCounts = courseMapping.course.lecture.reduce((total, lecture) => {
        return total + lecture.question.length;
      }, 0);

      return {
        ...courseMapping,
        endedLecturesCount,
        totalPoints: questionCounts * 10,
      };
    });
    return result;
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
