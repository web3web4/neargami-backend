import { Lecture, PrismaClient } from '@prisma/client';
import { CreateLectureDto, UpdateLectureDto } from '../dtos/lecture.dto';
import { ILecture } from '../interfaces/lecture.interface';
import { Service } from 'typedi';

@Service()
export class LectureService {
  public prisma = new PrismaClient();
  async create(data1: CreateLectureDto): Promise<Lecture> {
    return this.prisma.lecture.create({ data: data1 });
  }

  async findAll(): Promise<ILecture[]> {
    return this.prisma.lecture.findMany({ where: { deletedAt: null }, include: { course: true, question: true, userLecture: true } });
  }

  async findOne(id1: bigint): Promise<ILecture | null> {
    return this.prisma.lecture.findUnique({ where: { id: id1 }, include: { course: true, question: true, userLecture: true } });
  }

  async update(id1: bigint, data: UpdateLectureDto): Promise<ILecture> {
    return this.prisma.lecture.update({
      where: { id: id1 },
      data,
    });
  }

  async delete(id1: bigint): Promise<ILecture> {
    return this.prisma.lecture.update({
      where: { id: id1 },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
