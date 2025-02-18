import { PrismaClient, Course, User, Prisma, SearchQuery } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, Status } from '../dtos/course.dto';
import Container, { Service } from 'typedi';
import { HttpException } from '../exceptions/HttpException';
import { SUPER_ADMIN_PASS } from '../config';
import { PrismaService } from './prisma.service';
import { max } from 'class-validator';
import { MailService } from './mail.service';
import Fuse from 'fuse.js';
@Service()
export class CourseService {
  private prismaService = Container.get(PrismaService);
  private mailService = Container.get(MailService);
  private course = this.prismaService.course;
  private coursestatuslog = this.prismaService.courseStatusLog;
  private prisma = this.prismaService.prisma;
  private searchQuery = this.prismaService.searchQuery;

  public async getAllUsersStartingCourse(course_id: number) {
    const users = await this.prisma.userCoursesMapping.findMany({ where: { course_id } });
    const AllUsers = await this.prisma.user.findMany({ where: { id: { in: users.map(user => user.user_id) } } });
    return AllUsers;
  }
  public async getCourseStatusLog(courseSlug: string) {
    const course = await this.course.findFirst({ where: { slug: courseSlug }, include: { CourseStatusLog: true } });
  }

  // Output: A random UUID like 'e58d48b6-2e34-4c41-9f5d-3bb7b02d3c4e'

  public async search(searchQuery: string): Promise<Course[]> {
    const sanitizedQuery = searchQuery.toLowerCase().trim();
    const courses = await this.course.findMany({
      where: {
        OR: [
          {
            title: { contains: sanitizedQuery, mode: 'insensitive' },
          },
          {
            description: { contains: sanitizedQuery, mode: 'insensitive' },
          },
          {
            lecture: {
              some: {
                OR: [
                  { title: { contains: sanitizedQuery, mode: 'insensitive' } },
                  { description: { contains: sanitizedQuery, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      },
      include: {
        lecture: {
          select: {
            id: true,
            title: true,
            description: true,
          },
          where: {
            OR: [{ title: { contains: sanitizedQuery, mode: 'insensitive' } }, { description: { contains: sanitizedQuery, mode: 'insensitive' } }],
          },
        },
      },
    });
    if (courses.length === 0) {
      await this.logSearchQuery(sanitizedQuery);
    }
    return courses;
  }

  /**
   * Logs the search query for analytics or future use.
   * @param query - The sanitized query to log
   */
  private async logSearchQuery(query: string): Promise<void> {
    const keywords = query.split(/\s+/);
    const now = new Date();
    console.log(keywords);
    for (const keyword of keywords) {
      try {
        await this.searchQuery.upsert({
          where: { keyword },
          update: {
            query: { push: query },
            timestamp: now,
          },
          create: {
            query: [query],
            keyword: keyword,
            timestamp: now,
          },
        });
      } catch (error) {
        throw new HttpException(500, 'Failed to log search query');
      }
    }
    console.log('h');
  }

  public async getKeywords(): Promise<SearchQuery[]> {
    const keywords = await this.searchQuery.findMany();

    return keywords;
  }

  public async createNewCourse(teacher_user_id: string, data1: CreateCourseDto, sluge: string): Promise<Course> {
    return this.course.create({
      data: {
        teacher_user_id: teacher_user_id,
        publish_status: Status.DRAFT,
        slug: sluge,
        ...data1,
      },
    });
  }
  public async getLastUserId(): Promise<number | null> {
    const lastCourse = await this.course.findFirst({
      orderBy: {
        id: 'desc', // Sort by ID in descending order
      },
      select: {
        id: true, // Select only the ID field
      },
    });

    return lastCourse?.id + 1 || null; // Return the ID or null if no record exists
  }
  public async getUserId(id: number): Promise<number | null> {
    const lastCourse = await this.course.findUnique({
      where: { id },
    });

    return lastCourse?.id || null; // Return the ID or null if no record exists
  }

  public async findUniqueCourseBySlug(slug: string): Promise<Course> {
    return this.course.findFirst({ where: { slug } });
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

  public async findAllCoursesByStatus(id: string): Promise<any> {
    let AllCourses: Course[];
    const userCoursesCounts = await this.prisma.userCoursesMapping.groupBy({
      by: ['course_id'],
      _count: {
        start_time: true,
        end_time: true,
      },
    });
    if (id === 'ALL') {
      AllCourses = await this.course.findMany({
        include: { CourseStatusLog: true, lecture: { include: { question: true } }, teacher: true },
      });
    } else {
      AllCourses = await this.course.findMany({
        where: { publish_status: id as Status },

        include: { CourseStatusLog: true, lecture: { include: { question: true } }, teacher: true },
      });
    }
    AllCourses = (AllCourses as any).map(course => ({
      ...course,
      counts: userCoursesCounts.find(c => c.course_id === course.id),
      total_score: course.lecture.reduce((total, lecture) => total + lecture.question.length * 10, 0),
    }));
    return AllCourses;
  }
  public async findAllPage({ offset, limit }: { offset: number; limit: number }): Promise<Course[]> {
    const paginatedCourses: Course[] = await this.course.findMany({
      skip: offset, // Skip the specified number of records
      take: limit, // Limit the number of records fetched
      include: { teacher: true }, // Include related teacher information
    });
    return paginatedCourses;
  }

  public async countAll(): Promise<number> {
    const totalCourses: number = await this.course.count();
    return totalCourses;
  }

  public async findAll(): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({ include: { teacher: true } });
    return AllCourses;
  }
  public async findAllWithAuth(id: string): Promise<Course[]> {
    const AllCourses: Course[] = await this.course.findMany({ include: { teacher: true } });
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { flags: true },
    });

    if (user?.flags && typeof user.flags === 'object' && !Array.isArray(user.flags)) {
      const updatedFlags = {
        ...(user.flags as Record<string, unknown>), // Explicitly cast as an object
        first_request_approved_courses: true, // Update only this field
      };

      const changeFetchCoursesFlag = await this.prisma.user.update({
        data: { flags: updatedFlags },
        where: { id },
      });
    }
    return AllCourses;
  }
  public async findOneCourse(id: number): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    return course;
  }
  public async findOne(id: number): Promise<Course> {
    const course = await this.course.findUnique({ where: { id }, include: { lecture: true, userCourses: true } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    return course;
  }

  async update(id: number, userId: string, data: UpdateCourseDto, sluge: string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }

    return this.course.update({
      where: { id },
      data: {
        title: data.title,
        publish_status: data.publish_status,
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        language: data.language,
        video: data.video,
        logo: data.logo,
        tag: data.tag,
        slug: sluge,
      },
    });
  }
  async findUniqueByTitle(id: number): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    return course;
  }
  //////////////////////////////////////

  // update log status for admin user
  async updateLogStatusForAdmin(
    id: number,
    isAdmin: boolean,
    userId: string,
    publish_status: Status,
    publish_status_reson: string,
    sluge: string,
    prevStatus,
  ): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }

    if (isAdmin == false) {
      throw new HttpException(403, 'this user is not admin to update status');
    }
    const changstatusdate = new Date();

    const statuslog = await this.coursestatuslog.create({
      data: {
        changeStatusReson: publish_status_reson,
        last_publish_status: course.publish_status,
        current_publish_status: publish_status,
        changeStatusDate: changstatusdate,
        course_id: course.id,
      },
    });
    //insert prev_status in table (courseStatusHistoryForAdmin)
    const logStatusForAdmin = await this.prisma.courseStatusHistoryForAdmin.create({
      data: {
        user_id: userId,
        course_id: id,
        prev_status: prevStatus,
        new_status: publish_status,
        create_at: new Date(Date.now()),
      },
    });
    // const sluge=this.stringToSlug(course.title,course.id);
    return this.course.update({
      where: { id },
      data: { publish_status: publish_status, slug: sluge },
    });
  }

  //////////////////////////////
  async updateStatus(id: number, isAdmin: boolean, publish_status: Status, publish_status_reson: string, sluge: string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }

    if (isAdmin == false) {
      throw new HttpException(403, 'this user is not admin to update status');
    }
    const changstatusdate = new Date();

    const statuslog = await this.coursestatuslog.create({
      data: {
        changeStatusReson: publish_status_reson,
        last_publish_status: course.publish_status,
        current_publish_status: publish_status,
        changeStatusDate: changstatusdate,
        course_id: course.id,
      },
    });
    // const sluge=this.stringToSlug(course.title,course.id);
    return this.course.update({
      where: { id },
      data: { publish_status: publish_status, slug: sluge },
    });
  }

  async stringToSlugById(title: string, id: number) {
    const baseSlug = title
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

    const uniqueSuffix = id; // Use timestamp for uniqueness
    return `${baseSlug}-${uniqueSuffix}`;
  }
  async updateForAllSlug() {
    const AllCourses: Course[] = await this.findAll();
    for (let i = 0; i < AllCourses.length; i++) {
      const id = AllCourses[i].id;
      const title = AllCourses[i].title;
      AllCourses[i].slug = await this.stringToSlugById(title, id);
      const sluge = AllCourses[i].slug;
      const updateCourses: Course = await this.course.update({
        where: { id },
        data: {
          slug: sluge,
        },
      });
    }

    //const updatAll= await this.course.updateMany({data:AllCourses});
    return AllCourses;
  }

  async delete(id: number, userId: string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    if (course.publish_status !== Status.REJECTED) {
      throw new HttpException(409, 'Cannot delete aproved courses');
    }
    return this.course.delete({ where: { id } });
  }
}
