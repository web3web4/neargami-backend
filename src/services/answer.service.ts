import { CreateAnswerDto, UpdateAnswerDto } from '../dtos/answer.dto';
import { IAnswer } from '../interfaces/answer.interface';
import { PrismaClient, Answer } from '@prisma/client';

import { Service } from 'typedi';

@Service()
export class AnswerService {
  public prisma = new PrismaClient();
  async create(data1: CreateAnswerDto): Promise<Answer> {
    return this.prisma.answer.create({ data: data1 });
  }

  async findAll(): Promise<IAnswer[]> {
    return this.prisma.answer.findMany({ include: { question: true } });
  }

  async findOne(id: bigint): Promise<IAnswer | null> {
    return this.prisma.answer.findUnique({ where: { id }, include: { question: true } });
  }

  async update(id: bigint, data: UpdateAnswerDto): Promise<IAnswer> {
    return this.prisma.answer.update({
      where: { id },
      data,
    });
  }

  async delete(id: bigint): Promise<IAnswer> {
    return this.prisma.answer.delete({ where: { id } });
  }
}
