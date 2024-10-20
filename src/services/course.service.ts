import { PrismaClient, Course } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, Status } from '../dtos/course.dto';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/HttpException';
@Service()
export class CourseService {
  public course = new PrismaClient().course;

  public async createNewCourse(teacher_user_id: string, createcourseDto: CreateCourseDto): Promise<Course> {
    return this.course.create({
      data: {
        teacher_user_id: teacher_user_id,
        publish_status: Status.DRAFT,
        ...createcourseDto,
      },
    });
  }
  public async findAllTeacherCourses(id: string): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({ where: { teacher_user_id: id }, include: { lecture: true, teacher: true } });
    return AllCourses;
  }
  public async findAll(): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({ include: { teacher: true } });
    return AllCourses;
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.course.findUnique({ where: { id }, include: { lecture: true, userCourses: true } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    return course;
  }

  async update(id: number, userId: string, data: UpdateCourseDto): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    return this.course.update({
      where: { id },
      data,
    });
  }

  async delete(id: number, userId: string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    return this.course.delete({ where: { id } });
  }
}
