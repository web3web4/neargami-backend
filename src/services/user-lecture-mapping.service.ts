import { UserLectureMapping } from '@prisma/client';
import Container, { Service } from 'typedi';
import { LectureService } from './lecture.service';
import { HttpException } from '@/exceptions/HttpException';
import { PrismaService } from './prisma.service';
import { UserCoursesMappingService } from './user-courses-mapping.service';

@Service()
export class UserLectureMappingService {
  private prismaService = Container.get(PrismaService);
  private prisma = this.prismaService.prisma;
  private lecture = Container.get(LectureService);
  private lecturePrisma = this.prismaService.lecture;
  private userCourseService = Container.get(UserCoursesMappingService);

  async register(user_id: string, course_id: number, lecture_id: number): Promise<UserLectureMapping> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id === user_id) {
      throw new HttpException(409, 'You are the teacher of this course');
    }
    const userCoures = await this.prisma.userCoursesMapping.findFirst({ where: { AND: { user_id, course_id } } });
    if (!userCoures) {
      throw new HttpException(409, 'Course not registered');
    }
    const userLecture = await this.prisma.userLectureMapping.findFirst({ where: { AND: { user_id, lecture_id, course_id } } });
    if (userLecture) {
      throw new HttpException(409, 'Lecture allready registered');
    }

    return this.prisma.userLectureMapping.create({ data: { user_id, lecture_id, course_id }, include: { lecture: true } });
  }
  async answer(user_id: string, course_id: number, lecture_id: number, question_id: number, answer_id: number): Promise<any> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id === user_id) {
      throw new HttpException(409, 'You are the teacher of this course');
    }
    const userCoures = await this.prisma.userCoursesMapping.findFirst({ where: { AND: { user_id, course_id } } });
    if (!userCoures) {
      throw new HttpException(409, 'Course not registered');
    }
    const userLecture = await this.prisma.userLectureMapping.findFirst({ where: { AND: { user_id, lecture_id, course_id } } });
    if (!userLecture) {
      throw new HttpException(409, 'Lecture not registered');
    }
    const question = await this.prisma.question.findFirst({ where: { AND: { id: question_id, lecture_id } } });
    if (!question) {
      throw new HttpException(404, 'Question not found');
    }
    const answer = await this.prisma.answer.findFirst({ where: { AND: { id: answer_id, question_id } } });
    const correctAnswers = await this.prisma.answer.findMany({ where: { AND: { question_id, is_correct: true } } });
    if (!answer) {
      throw new HttpException(404, 'Answer not found');
    }
    await this.prisma.userQuestionAnswer.create({ data: { student_id: user_id, course_id, lecture_id, question_id, answer_id } });
    return { correctAnswers, is_correct: answer.is_correct };
  }
  async answerMany(user_id: string, course_id: number, lecture_id: number, question_id: number, answer_ids: number[]): Promise<any> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id === user_id) {
      throw new HttpException(409, 'You are the teacher of this course');
    }
    const userCoures = await this.prisma.userCoursesMapping.findFirst({ where: { AND: { user_id, course_id } } });
    if (!userCoures) {
      throw new HttpException(409, 'Course not registered');
    }
    const userLecture = await this.prisma.userLectureMapping.findFirst({ where: { AND: { user_id, lecture_id, course_id } } });
    if (!userLecture) {
      throw new HttpException(409, 'Lecture not registered');
    }
    const question = await this.prisma.question.findFirst({ where: { AND: { id: question_id, lecture_id } } });
    if (!question) {
      throw new HttpException(404, 'Question not found');
    }
    const correctAnswers = await this.prisma.answer.findMany({ where: { AND: { question_id } } });
    for (const answer_id of answer_ids) {
      if (!correctAnswers.some(correctAnswer => correctAnswer.id === answer_id)) {
        throw new HttpException(404, 'Answer not found');
      }
    }
    let trueAnswer = true;
    for (const answer_id of answer_ids) {
      if (correctAnswers.some(correctAnswers => correctAnswers.id === answer_id && !correctAnswers.is_correct)) {
        trueAnswer = false;
      }
    }
    const data = answer_ids.map(answer_id => ({ student_id: user_id, course_id, lecture_id, question_id, answer_id, is_correct: trueAnswer }));
    const preAnswers = await this.prisma.userQuestionAnswer.findMany({
      where: { student_id: user_id, course_id, lecture_id, question_id },
      include: { answer: true },
    });
    if (preAnswers.length === 0) {
      await this.prisma.userQuestionAnswer.createMany({ data });
      if (trueAnswer) {
        await this.prisma.user.update({ where: { id: user_id }, data: { ngc: { increment: 10 }, top_points: { increment: 10 } } });
      }
    } else if (preAnswers.length > 0 && preAnswers.some(preAnswer => preAnswer.answer.is_correct === false)) {
      await this.prisma.userQuestionAnswer.deleteMany({ where: { student_id: user_id, course_id, lecture_id, question_id } });
      await this.prisma.userQuestionAnswer.createMany({ data });
      if (trueAnswer) {
        await this.prisma.user.update({ where: { id: user_id }, data: { ngc: { increment: 10 }, top_points: { increment: 10 } } });
      }
    }
    return { correctAnswers };
  }
  async finish(user_id: string, course_id: number, lecture_id: number): Promise<UserLectureMapping> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id === user_id) {
      throw new HttpException(409, 'You are the teacher of this course');
    }
    const userCoures = await this.prisma.userCoursesMapping.findFirst({ where: { AND: { user_id, course_id } } });
    if (!userCoures) {
      throw new HttpException(409, 'Course not registered');
    }
    const userLecture = await this.prisma.userLectureMapping.findFirst({ where: { AND: { user_id, lecture_id, course_id } } });
    if (!userLecture) {
      throw new HttpException(409, 'Lecture not registered');
    }
    const lectures = await this.lecturePrisma.findMany({ where: { course_id }, orderBy: { order: 'desc' } });
    if (lecture.order === lectures[0].order) {
    }
    this.userCourseService.finish(user_id, course_id);
    return this.prisma.userLectureMapping.update({
      where: { id: userLecture.id },
      data: { end_at: new Date() },
      include: { lecture: true },
    });
  }

  async findAll(user_id: string, course_id: number): Promise<UserLectureMapping[]> {
    return this.prisma.userLectureMapping.findMany({ where: { AND: { user_id, course_id } }, include: { lecture: true } });
  }

  // async findOne(id: bigint): Promise<IUserLectureMapping | null> {
  //   return this.prisma.userLectureMapping.findUnique({ where: { id }, include: { lecture: true, userCoursesMapping: true } });
  // }

  // async update(id: bigint, data: UpdateUserLectureMappingDto): Promise<IUserLectureMapping> {
  //   return this.prisma.userLectureMapping.update({
  //     where: { id },
  //     data,
  //   });
  // }

  // async delete(id: bigint): Promise<IUserLectureMapping> {
  //   return this.prisma.userLectureMapping.delete({ where: { id } });
  // }
}
