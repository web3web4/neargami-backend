import { PrismaClient, UserLectureMapping } from "@prisma/client";
import { CreateUserLectureMappingDto, UpdateUserLectureMappingDto } from "../dtos/user-lecture-mapping.dto";
import { IUserLectureMapping } from "../interfaces/user-lecture-mapping.interface";
import { Service } from "typedi";

@Service()
export class UserLectureMappingService {
  public prisma = new PrismaClient();
  async create(data1: CreateUserLectureMappingDto): Promise<IUserLectureMapping> {
    return this.prisma.userLectureMapping.create({ data: data1 });
  }

  async findAll(): Promise<IUserLectureMapping[]> {
    return this.prisma.userLectureMapping.findMany({ include: { lecture: true, userCoursesMapping: true } });
  }

  async findOne(id: bigint): Promise<IUserLectureMapping | null> {
    return this.prisma.userLectureMapping.findUnique({ where: { id }, include: { lecture: true, userCoursesMapping: true } });
  }

  async update(id: bigint, data: UpdateUserLectureMappingDto): Promise<IUserLectureMapping> {
    return this.prisma.userLectureMapping.update({
      where: { id },
      data,
    });
  }

  async delete(id: bigint): Promise<IUserLectureMapping> {
    return this.prisma.userLectureMapping.delete({ where: { id } });
  }
}
