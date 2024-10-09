import { PrismaClient, UserCoursesMapping } from "@prisma/client";
import { CreateUserCoursesMappingDto, UpdateUserCoursesMappingDto } from "../dtos/user-courses-mapping.dto";
import { IUserCoursesMapping } from "../interfaces/user-courses-mapping.interface";
import { Service } from "typedi";

@Service()
export class UserCoursesMappingService {
  public prisma = new PrismaClient();
  async create(data1: CreateUserCoursesMappingDto): Promise<UserCoursesMapping> {
    return this.prisma.userCoursesMapping.create({ data: data1 });
  }

  async findAll(): Promise<IUserCoursesMapping[]> {
    return this.prisma.userCoursesMapping.findMany({ include: { user: true, course: true, userLecture: true } });
  }

  async findOne(id: bigint): Promise<IUserCoursesMapping | null> {
    return this.prisma.userCoursesMapping.findUnique({ where: { id }, include: { user: true, course: true, userLecture: true } });
  }

  async update(id: bigint, data: UpdateUserCoursesMappingDto): Promise<IUserCoursesMapping> {
    return this.prisma.userCoursesMapping.update({
      where: { id },
      data,
    });
  }

  async delete(id: bigint): Promise<IUserCoursesMapping> {
    return this.prisma.userCoursesMapping.delete({ where: { id } });
  }
}
