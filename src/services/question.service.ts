import { PrismaClient, Question } from '@prisma/client';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import Container, { Service } from 'typedi';
import { LectureService } from './lecture.service';
import { HttpException } from '@/exceptions/HttpException';

@Service()
export class QuestionService {
  public question = new PrismaClient().question;
  public lecture = Container.get(LectureService);
  async create(course_id: number, lecture_id: number, userId: string, createQuestionDto: CreateQuestionDto): Promise<Question> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    const { options, ...data } = createQuestionDto;
    return this.question.create({ data: { ...data, lecture_id, answer: { createMany: { data: options } } } });
  }

  async findAll(course_id: number, lecture_id: number): Promise<Question[]> {
    await this.lecture.findOne(lecture_id, course_id);
    return this.question.findMany({ where: { lecture_id }, include: { lecture: true, answer: true } });
  }

  async findOne(course_id: number, lecture_id: number, id: number): Promise<Question> {
    await this.lecture.findOne(lecture_id, course_id);
    const question = await this.question.findFirst({ where: { AND: { id, lecture_id } }, include: { lecture: true, answer: true } });
    if (!question) {
      throw new HttpException(404, 'Question not found');
    }
    return question;
  }

  async update(id: number, course_id: number, lecture_id: number, userId: string, data: UpdateQuestionDto): Promise<Question> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }

    const question = await this.question.findFirst({ where: { AND: { id, lecture_id } } });
    if (!question) {
      throw new HttpException(404, 'Question not found');
    }
    return this.question.update({
      where: { id },
      data,
    });
  }

  async delete(id: number, course_id: number, lecture_id: number, userId: string): Promise<Question> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }

    const question = await this.question.findFirst({ where: { AND: { id, lecture_id } } });
    if (!question) {
      throw new HttpException(404, 'Question not found');
    }
    return this.question.delete({ where: { id } });
  }
}
