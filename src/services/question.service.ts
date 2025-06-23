import { Question } from '@prisma/client';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import Container, { Service } from 'typedi';
import { LectureService } from './lecture.service';
import { HttpException } from '../exceptions/HttpException';
import { PrismaService } from './prisma.service';

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

    // Check if there are questions with null sequence and fix them
    const questionsWithNullSequence = questions.filter(q => q.sequence === null);

    if (questionsWithNullSequence.length > 0) {
      // First, try to get sequence from parent course if exists
      const course = await this.prisma.course.findUnique({
        where: { id: lecture.course_id },
        select: { parent_version_id: true },
      });

      let sequenceFixed = false;

      // If this course has a parent version, try to get sequence from parent
      if (course && course.parent_version_id && course.parent_version_id !== lecture.course_id) {
        const parentLecture = await this.prisma.lecture.findFirst({
          where: {
            course_id: course.parent_version_id,
            title: lecture.title,
          },
        });

        if (parentLecture) {
          const parentQuestions = await this.prisma.question.findMany({
            where: { lecture_id: parentLecture.id },
            orderBy: { sequence: 'asc' },
          });

          // Update questions with matching descriptions from parent
          for (const question of questionsWithNullSequence) {
            const matchingParentQuestion = parentQuestions.find(pq => pq.description === question.description);
            if (matchingParentQuestion && matchingParentQuestion.sequence !== null) {
              // Update the sequence in database
              await this.prisma.question.update({
                where: { id: question.id },
                data: { sequence: matchingParentQuestion.sequence },
              });
              question.sequence = matchingParentQuestion.sequence;
              sequenceFixed = true;
            }
          }
        }
      }

      // For any remaining questions with null sequence, assign sequential numbers
      const remainingNullQuestions = questions.filter(q => q.sequence === null);
      if (remainingNullQuestions.length > 0) {
        // Get the highest existing sequence number
        const maxSequence = Math.max(...questions.filter(q => q.sequence !== null).map(q => q.sequence), 0);

        // Assign sequential numbers starting from maxSequence + 1
        for (let i = 0; i < remainingNullQuestions.length; i++) {
          const newSequence = maxSequence + i + 1;
          await this.prisma.question.update({
            where: { id: remainingNullQuestions[i].id },
            data: { sequence: newSequence },
          });
          remainingNullQuestions[i].sequence = newSequence;
        }
      }

      // Re-sort questions by sequence after updates
      questions.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
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
