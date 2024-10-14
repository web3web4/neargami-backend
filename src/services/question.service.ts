import { PrismaClient, Question } from '@prisma/client';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import { IQuestion } from '../interfaces/question.interface';
import Container, { Service } from 'typedi';
import { LectureService } from './lecture.service';
import { HttpException } from '@/exceptions/HttpException';

@Service()
export class QuestionService {
  public question = new PrismaClient().question;
  public lecture = Container.get(LectureService);
  async create(course_id: number, lecture_id: number, userId: string, data: CreateQuestionDto): Promise<Question> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);

    return this.question.create({ ...data, lecture_id });
  }

  async findAll(): Promise<IQuestion[]> {
    return this.question.findMany({ include: { lecture: true, answer: true } });
  }

  async findOne(id: number): Promise<IQuestion | null> {
    return this.question.findUnique({ where: { id }, include: { lecture: true, answer: true } });
  }

  async update(id: number, data: UpdateQuestionDto): Promise<IQuestion> {
    return this.question.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<IQuestion> {
    return this.question.delete({ where: { id } });
  }
}
