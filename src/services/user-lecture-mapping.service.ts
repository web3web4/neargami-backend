import { PrismaClient, UserLectureMapping } from '@prisma/client';
import { CreateUserLectureMappingDto, UpdateUserLectureMappingDto } from '../dtos/user-lecture-mapping.dto';
import { IUserLectureMapping } from '../interfaces/user-lecture-mapping.interface';
import Container, { Service } from 'typedi';
import { LectureService } from './lecture.service';
import { HttpException } from '@/exceptions/HttpException';

@Service()
export class UserLectureMappingService {
  public prisma = new PrismaClient();
  public lecture = Container.get(LectureService);
  async register(user_id: string, course_id: number, lecture_id: number): Promise<UserLectureMapping> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== user_id) {
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
  async answer(user_id: string, course_id: number, lecture_id: number, question_id: number, answer_id: number): Promise<boolean> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== user_id) {
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
    if (!answer) {
      throw new HttpException(404, 'Answer not found');
    }
    await this.prisma.userQuestionAnswer.create({ data: { student_id: user_id, course_id, lecture_id, question_id, answer_id } });
    return answer.is_correct;
  }
  async finish(user_id: string, course_id: number, lecture_id: number): Promise<UserLectureMapping> {
    const lecture = await this.lecture.findOne(lecture_id, course_id);
    if (lecture.course.teacher_user_id !== user_id) {
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
