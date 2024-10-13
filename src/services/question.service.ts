import { PrismaClient, Question } from '@prisma/client';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import { IQuestion } from '../interfaces/question.interface';
import { Service } from 'typedi';

@Service()
export class QuestionService {
  public prisma = new PrismaClient();
  async create(data1: CreateQuestionDto): Promise<Question> {
    data1.createdAt = new Date();
    return this.prisma.question.create({ data: data1 });
  }

  async findAll(): Promise<IQuestion[]> {
    return this.prisma.question.findMany({ where: { deletedAt: null }, include: { lecture: true, answer: true } });
  }

  async findOne(id: number): Promise<IQuestion | null> {
    return this.prisma.question.findUnique({ where: { id }, include: { lecture: true, answer: true } });
  }

  async update(id: number, data: UpdateQuestionDto): Promise<IQuestion> {
    return this.prisma.question.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<IQuestion> {
    return this.prisma.question.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
