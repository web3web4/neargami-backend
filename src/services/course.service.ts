import { PrismaClient, Course } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, Status } from '../dtos/course.dto';
import { ICourse, ICoursefull, ICoursewithoutUserId } from '../interfaces/course.interface';
import { Service } from 'typedi';
@Service()
export class CourseService {
  public prisma = new PrismaClient();

  public async createNewCourse(createcourseDto: CreateCourseDto): Promise<Course> {
    // const status: Status = createcourseDto.publish_status;
    const teacher_user_id = createcourseDto.teacher_user_id;
    const title = createcourseDto.icoursewithoutUserId.title;
    const publish_status = createcourseDto.icoursewithoutUserId.publish_status;
    return this.prisma.course.create({ data: { teacher_user_id: teacher_user_id, title: title, publish_status: publish_status } });
  }

  public async findAll(id: string): Promise<Course[]> {
    const AllCourses: Course[] = await this.prisma.course.findMany({ where: { teacher_user_id: id } });
    return AllCourses;
  }

  async findOne(id: bigint): Promise<ICoursefull | null> {
    return this.prisma.course.findUnique({ where: { id: id }, include: { lecture: true, userCourses: true } });
  }

  async update(id1: bigint, data: UpdateCourseDto): Promise<ICoursefull> {
    return this.prisma.course.update({
      where: { id: id1 },
      data,
    });
  }

  async delete(id1: bigint): Promise<ICoursefull> {
    return this.prisma.course.delete({ where: { id: id1 } });
  }
}
