import { Question } from '@prisma/client';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import Container, { Service } from 'typedi';
import { LectureService } from './lecture.service';
import { HttpException } from '../exceptions/HttpException';
import { PrismaService } from './prisma.service';
// import { exceptions } from 'winston';

@Service()
export class QuestionService {
  private prismaService = Container.get(PrismaService);
  private prisma = this.prismaService.prisma;
  private lecture = Container.get(LectureService);
  async create(course_id: number, lecture_id: number, userId: string, createQuestionDto: CreateQuestionDto): Promise<Question> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    const { options, ...data } = createQuestionDto;
    const questions = await this.prisma.question.findMany({ where: { lecture_id } });
    return this.prisma.question.create({
      data: { ...data, sequence: Math.floor(questions.length + 1), lecture_id, answer: { createMany: { data: options } } },
    });
  }

  async findAll(course_id: number, lecture_id: number): Promise<Question[]> {
    await this.lecture.findOne(lecture_id, course_id);
    return this.prisma.question.findMany({
      where: { lecture_id },
      include: {
        lecture: { include: { course: { select: { logo: true } } } },
        answer: { omit: { is_correct: true }, include: { UserQuestionAnswer: true } },
      },
      orderBy: { sequence: 'asc' },
    });
  }
  ///////
  async findQuestionsByLectureSlug(slug: string): Promise<Question[]> {
    const lecture = await this.lecture.findAllLEcturesBySlug(slug);
    if (!lecture) {
      throw new HttpException(400, 'there is no lecture by this slug');
    }
    await this.lecture.findOne(lecture.id, lecture.course_id);

    // Get the questions for the current lecture
    const questions = await this.prisma.question.findMany({
      where: { lecture_id: lecture.id },
      include: {
        lecture: { include: { course: { select: { logo: true, slug: true, parent_version_id: true } } } },
        answer: { omit: { is_correct: true }, include: { UserQuestionAnswer: true } },
      },
      orderBy: { sequence: 'asc' },
    });

    // If the course has a parent version and there are questions with null sequence
    if (lecture.course_id && questions.some(q => q.sequence === null)) {
      // Get the course to check if it has a parent version
      const course = await this.prisma.course.findUnique({
        where: { id: lecture.course_id },
        select: { parent_version_id: true },
      });

      // If this course has a parent version
      if (course && course.parent_version_id && course.parent_version_id !== lecture.course_id) {
        // Find the corresponding lecture in the parent course
        const parentLecture = await this.prisma.lecture.findFirst({
          where: {
            course_id: course.parent_version_id,
            title: lecture.title, // Assuming lectures with same title correspond between versions
          },
        });

        if (parentLecture) {
          // Get questions from the parent lecture
          const parentQuestions = await this.prisma.question.findMany({
            where: { lecture_id: parentLecture.id },
            orderBy: { sequence: 'asc' },
          });

          // Map parent questions to current questions based on description similarity
          for (const question of questions) {
            if (question.sequence === null) {
              // Find matching question in parent by description
              const matchingParentQuestion = parentQuestions.find(pq => pq.description === question.description);

              if (matchingParentQuestion && matchingParentQuestion.sequence) {
                // Update the sequence in memory (not in database)
                question.sequence = matchingParentQuestion.sequence;
              }
            }
          }
        }
      }
    }

    return questions;
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
