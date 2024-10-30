import { PrismaClient, Course } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, Status } from '../dtos/course.dto';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/HttpException';
import { max, maxDate } from 'class-validator';
import { title } from 'process';
@Service()
export class CourseService {
  public course = new PrismaClient().course;
  public coursestatuslog = new PrismaClient().courseStatusLog;
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
  public async findAllByTag(tag: string): Promise<Course[]> {
    const currentStatus = Status.APPROVED;
    const AllCourses: Course[] = await this.course.findMany({
      where: {
        AND: [{ publish_status: currentStatus }, { tag: tag }],
      },
      include: { lecture: true, teacher: true },
    });
    return AllCourses;
  }
  public async findAllByTextSearch(phras: string): Promise<Course[]> {
    const currentStatus = Status.APPROVED;
    const AllCourses: Course[] = await this.course.findMany({
      where: {
        AND: [
          { publish_status: currentStatus }, // Only include courses with 'APPROVED' status
          {
            OR: [{ title: { equals: phras } }, { name: { equals: phras } }, { tag: phras }],
          },
        ],
      },
      include: { lecture: true, teacher: true },
    });
    return AllCourses;
  }

  public async findAllBySubTextSearch(phrase: string): Promise<Course[]> {
    const currentStatus = Status.APPROVED;
    const AllCourses: Course[] = await this.course.findMany({
      where: {
        AND: [
          { publish_status: currentStatus }, // Only include courses with 'APPROVED' status
          {
            OR: [
              { name: { contains: phrase, mode: 'insensitive' } },
              { title: { contains: phrase, mode: 'insensitive' } },
              { tag: { contains: phrase, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: { lecture: true, teacher: true },
    });
    return AllCourses;
  }

  public async findAllCoursesByStatus(id: Status): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({
      where: { publish_status: id },

      include: { CourseStatusLog: { select: { changeStatusReson: true } }, lecture: true, teacher: true },
    });
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
  async updateStatus(id: number, isAdmin: boolean, publish_status: Status, publish_status_reson: string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }

    if (isAdmin == false) {
      throw new HttpException(403, 'this user is not admin to update status');
    }
    const changstatusdate = new Date();
    //const coursestatuslogs = await this.coursestatuslog.findMany({ where: { course_id: id } });
    //let maxdatestatuslog: Date = null;
    // for (let i = 0; i < coursestatuslogs.length;i++){
    //   if (coursestatuslogs[i].changeStatusDate > maxdatestatuslog) {
    //     maxdatestatuslog = coursestatuslogs[i].changeStatusDate;
    // }

    // }
    const statuslog = await this.coursestatuslog.create({
      data: {
        changeStatusReson: publish_status_reson,
        last_publish_status: course.publish_status,
        current_publish_status: publish_status,
        changeStatusDate: changstatusdate,
        course_id: course.id,
      },
    });
    return this.course.update({
      where: { id },
      data: { publish_status: publish_status },
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
  