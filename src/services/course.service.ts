import { PrismaClient, Course } from "@prisma/client";
import { CreateCourseDto, UpdateCourseDto, Status } from "../dtos/course.dto";
import { ICourse } from "../interfaces/course.interface";
import { Service } from "typedi";
@Service()
export class CourseService {
  public prisma = new PrismaClient();

  public async createNewCourse(createcourseDto: CreateCourseDto): Promise<Course> {
    const status: Status = createcourseDto.publish_status;
    return this.prisma.course.create({ data: createcourseDto });
  }

  public async findAll(): Promise<ICourse[]> {
    const AllCourses: ICourse[] = await this.prisma.course.findMany();
    return AllCourses;
  }

  async findOne(id: bigint): Promise<ICourse | null> {
    return this.prisma.course.findUnique({ where: { id: id }, include: { lecture: true, userCourses: true } });
  }

  async update(id1: bigint, data: UpdateCourseDto): Promise<ICourse> {
    return this.prisma.course.update({
      where: { id: id1 },
      data,
    });
  }

  async delete(id1: bigint): Promise<ICourse> {
    return this.prisma.course.delete({ where: { id: id1 } });
  }
}
