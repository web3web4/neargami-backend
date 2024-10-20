import { PrismaClient, Question } from '@prisma/client';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import Container, { Service } from 'typedi';
import { LectureService } from './lecture.service';
import { HttpException } from '@/exceptions/HttpException';

@Service()
export class QuestionService {
  public prisma = new PrismaClient();
  public lecture = Container.get(LectureService);
  async create(course_id: number, lecture_id: number, userId: string, createQuestionDto: CreateQuestionDto): Promise<Question> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    const { options, ...data } = createQuestionDto;
    return this.prisma.question.create({
      data: { ...data, sequence: Math.floor(Math.random() * 1000), lecture_id, answer: { createMany: { data: options } } },
    });
  }

  async findAll(course_id: number, lecture_id: number): Promise<Question[]> {
    await this.lecture.findOne(lecture_id, course_id);
    return this.prisma.question.findMany({
      where: { lecture_id },
      include: { lecture: { include: { course: { select: { logo: true } } } }, answer: { omit: { is_correct: true } } },
    });
  }

  async findOne(course_id: number, lecture_id: number, id: number): Promise<Question> {
    await this.lecture.findOne(lecture_id, course_id);
    const question = await this.prisma.question.findFirst({ where: { AND: { id, lecture_id } }, include: { lecture: true, answer: true } });
    if (!question) {
      throw new HttpException(404, 'Question not found');
    }
    return question;
  }

  async update(id: number, course_id: number, lecture_id: number, userId: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    const { options, ...data } = updateQuestionDto;
    if (lecture.course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }

    const question = await this.prisma.question.findFirst({ where: { AND: { id, lecture_id } } });
    if (!question) {
      throw new HttpException(404, 'Question not found');
    }
    let updatedQuestion: Question;
    await this.prisma.$transaction(async prisma => {
      for (const option of options) {
        const answer = await prisma.answer.findFirst({ where: { AND: { question_id: id, id: option.id } } });
        if (!answer) {
          throw new HttpException(400, 'Answer not found');
        }
        await prisma.answer.update({
          where: { id: option.id },
          data: {
            description: option.description,
            is_correct: option.is_correct,
          },
        });
      }
      updatedQuestion = await prisma.question.update({
        where: { id },
        data,
        include: { lecture: true, answer: true },
      });
    });
    return updatedQuestion;
  }

  async delete(id: number, course_id: number, lecture_id: number, userId: string): Promise<Question> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }

    const question = await this.prisma.question.findFirst({ where: { AND: { id, lecture_id } } });
    if (!question) {
      throw new HttpException(404, 'Question not found');
    }
    return this.prisma.question.delete({ where: { id } });
  }
}
