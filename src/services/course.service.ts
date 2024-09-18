import { CreateCourseDto, UpdateCourseDto } from '@/dtos/courses.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Course } from '@/interfaces/course.interfact';
import { PrismaClient } from '@prisma/client';
import Container, { Service } from 'typedi';
import { UserService } from './users.service';

@Service()
export class CourseService {
  public course = new PrismaClient().course;
  public user = Container.get(UserService);

  public async findAllCourse(): Promise<Course[]> {
    const allCourse: Course[] = await this.course.findMany();
    return allCourse;
  }

  public async findCourseById(courseId: number): Promise<Course> {
    const findCourse: Course = await this.course.findUnique({ where: { id: courseId } });
    if (!findCourse) throw new HttpException(409, "Course doesn't exist");
    return findCourse;
  }

  public async createCourse(courseData: CreateCourseDto): Promise<Course> {
    const user = await this.user.findUserById(courseData.teacherId);
    if (!user) throw new HttpException(409, 'User not found');
    return await this.course.create({ data: courseData });
  }

  public async updateCourse(courseId: number, courseData: UpdateCourseDto): Promise<Course> {
    const course = await this.findCourseById(courseId);
    if (!course) throw new HttpException(409, "Course doesn't exist");
    const { teacherId } = courseData;
    const user = await this.user.findUserById(teacherId);
    if (!user) throw new HttpException(409, 'User not found');
    if (course.teacherId !== teacherId) throw new HttpException(409, 'User is not a teacher of the course');
    return await this.course.update({ where: { id: courseId }, data: courseData });
  }

  public async deleteCourse(courseId: number): Promise<Course> {
    const course = await this.findCourseById(courseId);
    if (!course) throw new HttpException(409, "Course doesn't exist");
    return await this.course.delete({ where: { id: courseId } });
  }
}
