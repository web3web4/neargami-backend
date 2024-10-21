import { Lecture, PrismaClient } from '@prisma/client';
import { CreateLectureDto, UpdateLectureDto, UpdateLectureOrderArrayDto } from '../dtos/lecture.dto';
import Container, { Service } from 'typedi';
import { CourseService } from './course.service';
import { HttpException } from '@/exceptions/HttpException';
import { LectureWithRelations } from '@/interfaces/lecture.interface';

@Service()
export class LectureService {
  public lecture = new PrismaClient().lecture;
  public course = Container.get(CourseService);
  async create(userId: string, course_id: number, createLectureDto: CreateLectureDto): Promise<Lecture> {
    const course = await this.course.findOne(course_id);
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    return this.lecture.create({ data: { course_id, ...createLectureDto } });
  }

  async findAll(user_id: string, course_id: number): Promise<Lecture[]> {
    await this.course.findOne(course_id);

    return this.lecture.findMany({
      where: { course_id },
      include: {
        course: { include: { teacher: { select: { id: true, firstname: true, lastname: true, image: true } } } },
        question: true,
        userLecture: { where: { user_id }, select: { id: true, lecture_id: true, start_at: true, end_at: true } },
      },
    });
  }

  async findOne(id: number, course_id: number): Promise<LectureWithRelations> {
    await this.course.findOne(course_id);
    const lecture = await this.lecture.findUnique({ where: { id }, include: { course: true, question: true, userLecture: true } });
    if (!lecture) {
      throw new HttpException(404, 'Lecture not found');
    }
    return lecture;
  }

  async update(id: number, course_id: number, userId: string, data: UpdateLectureDto): Promise<Lecture> {
    const course = await this.course.findOne(course_id);
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }

    const lecture = await this.lecture.findFirst({ where: { AND: { id, course_id } } });
    if (!lecture) {
      throw new HttpException(404, 'Lecture not found');
    }
    return this.lecture.update({
      where: { id },
      data,
    });
  }
  async updateOrders(course_id: number, userId: string, data: UpdateLectureOrderArrayDto): Promise<Lecture[]> {
    const course = await this.course.findOne(course_id);
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    const lectureIds = data.orders.map(order => order.id); // Extract lecture IDs from the data

    // Check if all lectures exist in one query
    const lectures = await this.lecture.findMany({
      where: { id: { in: lectureIds }, course_id },
    });

    if (lectures.length !== lectureIds.length) {
      throw new HttpException(404, 'Some lectures not found');
    }

    // Prepare updates based on the orders
    const updatePromises = data.orders.map(order => {
      return this.lecture.update({
        where: { id: order.id },
        data: {
          order: order.order,
        },
      });
    });

    // Execute all updates concurrently
    const updatedLectures = await Promise.all(updatePromises);

    return updatedLectures;
  }

  async delete(id: number, course_id: number, userId: string): Promise<Lecture> {
    const course = await this.course.findOne(course_id);
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }

    const lecture = await this.lecture.findUnique({ where: { id } });
    if (!lecture) {
      throw new HttpException(404, 'Lecture not found');
    }
    return this.lecture.delete({ where: { id } });
  }
}
