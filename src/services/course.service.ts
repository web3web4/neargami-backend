import { PrismaClient, Course } from '@prisma/client';
import { CreateCourseDto, UpdateCourseDto, Status } from '../dtos/course.dto';
import Container, { Service } from 'typedi';
import { HttpException } from '../exceptions/HttpException';
import { SUPER_ADMIN_PASS } from '../config';
import { PrismaService } from './prisma.service';
import { max } from 'class-validator';
@Service()
export class CourseService {
private prismaService = Container.get(PrismaService);
  private course = this.prismaService.course;
  private coursestatuslog = this.prismaService.courseStatusLog;
  private prisma = this.prismaService.prisma;

public async getAllUsersStartingCourse(course_id:number ){
const users= await this.prisma.userCoursesMapping.findMany({where :{course_id}});
const AllUsers= await this.prisma.user.findMany({where:{id:{in:users.map((user)=>user.user_id)}}});
return AllUsers;




}
  public async createNewCourse(teacher_user_id:string, data1 : CreateCourseDto,sluge:string): Promise<Course> {

    return this.course.create({
      data: {
        teacher_user_id: teacher_user_id,
        publish_status: Status.DRAFT,
       slug:sluge,
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
  
    return lastCourse?.id+1 || null; // Return the ID or null if no record exists
  }
  public async getUserId(id:number): Promise<number | null> {
    const lastCourse = await this.course.findUnique({
    where:{id}
    });
  
    return lastCourse?.id || null; // Return the ID or null if no record exists
  }
   
  public async findUniqueCourseBySlug (slug:string): Promise<Course>{

    return this.course.findFirst({where:{slug}});
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
        include: { CourseStatusLog: { select: { changeStatusReson: true } }, lecture: { include: { question: true } }, teacher: true },
      });
    } else {
      AllCourses = await this.course.findMany({
        where: { publish_status: id as Status },

        include: { CourseStatusLog: { select: { changeStatusReson: true } }, lecture: { include: { question: true } }, teacher: true },
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
public async findOneCourse(id:number):Promise<Course>{

  const course =await this.course.findUnique({where:{id}});
  return course;
}
  public async findOne(id: number): Promise<Course> {
    const course = await this.course.findUnique({ where: { id }, include: { lecture: true, userCourses: true } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    return course;
  }

  async update(id: number, userId: string, data: UpdateCourseDto,sluge:string): Promise<Course> {
    const course = await this.course.findUnique({ where: { id } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
   
    
    return this.course.update({
      where: { id },
      data:{
        title:data.title,
        publish_status:data.publish_status,
        name:data.name,
        description:data.description,
        difficulty:data.difficulty,
        language:data.language,
        video:data.video,
        logo:data.logo,
        tag:data.tag,
         slug:sluge,

      },
    });
  }
  async findUniqueByTitle (id: number):Promise<Course>{

    const course = await this.course.findUnique( { where: { id } });
    return course;
  }
  async updateStatus(id: number, isAdmin: boolean, publish_status: Status, publish_status_reson: string,sluge:string): Promise<Course> {
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
    // const sluge=this.stringToSlug(course.title,course.id);
    return this.course.update({
      where: { id },
      data: { publish_status: publish_status,
         slug:sluge
       },
    });
  }

async stringToSlugById(title:string,id:number){
  const baseSlug = title
  .toLowerCase() // Convert to lowercase
  .trim() // Trim whitespace from both ends
  .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
  .replace(/\s+/g, '-') // Replace spaces with hyphens
  .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
  .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

const uniqueSuffix = id;// Use timestamp for uniqueness
return `${baseSlug}-${uniqueSuffix}`;


}
async updateForAllSlug( ){
const AllCourses: Course[]=await this.findAll();
for (let i=0;i<AllCourses.length;i++){
  let id = AllCourses[i].id;
  let title= AllCourses[i].title;
   AllCourses[i].slug= await this.stringToSlugById(title,id);
   let sluge=AllCourses[i].slug;
   const updateCourses: Course=await this.course.update({where:{id},
    data:{
slug:sluge

    }
  
  })
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
