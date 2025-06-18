import { Lecture, UserLectureMapping } from '@prisma/client';
import { CreateLectureDto, UpdateLectureDto, UpdateLectureOrderArrayDto } from '../dtos/lecture.dto';
import Container, { Service } from 'typedi';
import { CourseService } from './course.service';
import { HttpException } from '../exceptions/HttpException';
import { LectureWithRelations } from '../interfaces/lecture.interface';
import { PrismaService } from './prisma.service';
import ImageKit from 'imagekit';
import fs from 'fs';
import { count } from 'console';
//import { Express } from 'express';
import multer from 'multer';
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});
@Service()
export class LectureService {
  [x: string]: any;
  private prismaService = Container.get(PrismaService);
  private lecture = this.prismaService.lecture;
  private course = Container.get(CourseService);
  private prisma = this.prismaService.prisma;

  constructor() {
    this.imageKit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    });
  }

  ////////
  async stringToSlugById(title: string, id: number) {
    const baseSlug = title
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

    const uniqueSuffix = id; // Use timestamp for uniqueness
    return `${baseSlug}-${uniqueSuffix}`;
  }
  async updateForAllSlug() {
    const lectures: Lecture[] = await this.lecture.findMany({});
    for (let i = 0; i < lectures.length; i++) {
      const id = lectures[i].id;
      const title = lectures[i].title;
      lectures[i].slug = await this.stringToSlugById(title, id);
      const sluge = lectures[i].slug;
      const updatedLectures: Lecture = await this.lecture.update({
        where: { id },
        data: {
          slug: sluge,
        },
      });
    }

    //const updatAll= await this.course.updateMany({data:lectures});
    return lectures;
  }
  //////
  async findAllLEcturesBySlug(slug: string) {
    return await this.lecture.findFirst({ where: { slug } });
  }
  async findAllLEcturesBySlugAuth(slug: string, user_id: string) {
    return await this.lecture.findFirst({
      where: { AND: { slug } },
      include: {
        userLecture: { where: { user_id } },
      },
    });
  }

  public async getLastUserId(): Promise<number | null> {
    const lastLecture = await this.lecture.findFirst({
      orderBy: {
        id: 'desc', // Sort by ID in descending order
      },
      select: {
        id: true, // Select only the ID field
      },
    });

    return lastLecture?.id + 1 || null; // Return the ID or null if no record exists
  }
  public async getUserId(id: number): Promise<number | null> {
    const lecture = await this.lecture.findUnique({
      where: { id },
    });

    return lecture?.id || null; // Return the ID or null if no record exists
  }

  ////
  async create(userId: string, course_id: number, createLectureDto: CreateLectureDto, slug: string): Promise<Lecture> {
    const course = await this.course.findOne(course_id);
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    return this.lecture.create({ data: { course_id, ...createLectureDto, slug } });
  }

  async checkLectureStart(user_id: string, lecture_id: number): Promise<any> {
    const check: UserLectureMapping = await this.prisma.userLectureMapping.findFirst({ where: { user_id, lecture_id } });
    return check;
  }

  async uploadImageToImageKitDisk(filePath: string, fileName: string): Promise<any> {
    try {
      const response = await imagekit.upload({
        file: fs.createReadStream(filePath), // Read the file
        fileName: fileName,
      });
      return response;
    } catch (error) {
      console.error('Error in ImageKit service:', error);
      throw error;
    }
  }
  // Upload image from buffer
  async uploadImageToImageKitBuffer(fileBuffer: Buffer, fileName: string): Promise<any> {
    if (!this.imageKit) {
      throw new Error('ImageKit client is not initialized');
    }
    try {
      const result = await this.imageKit.upload({
        file: fileBuffer,
        fileName: fileName,
      });
      return result; // Return the upload result
    } catch (error) {
      console.error('Error uploading image to ImageKit:', error);
      throw error;
    }
  }

  async findUniqueCourseBySlug(slug: string): Promise<any> {
    return await this.prismaService.course.findFirst({ where: { slug } });
    //await this.prisma.lecture.findMany({include:{course:{}}})
  }
  ///

  public async findAll_LecturesByCourseId(course_id: number): Promise<any> {
    // Group the user courses
    const userCoursesCounts = await this.prisma.userCoursesMapping.groupBy({
      by: ['course_id'],
      _count: {
        start_time: true,
        end_time: true,
      },
      where: { course_id },
    });

    // Fetch the lectures with the associated questions
    const lectures = await this.lecture.findMany({
      where: { course_id },
      include: {
        course: {
          include: {
            teacher: {
              omit: {
                address: true,
                signature: true,
                message: true,
                createdAt: true,
                isAdmin: true,
                ngc: true,
                game: true,
              },
            },
          },
        },
        question: true, // Include questions for each lecture
      },
      orderBy: {
        order: 'asc', // Specify the order field and direction ('asc' for ascending or 'desc' for descending)
      },
    });

    // Add totalPrize to each lecture (number of questions * 10)
    const lecturesWithPrize = lectures.map(lecture => ({
      ...lecture,
      totalPrize: lecture.question.length * 10, // Calculate prize for each lecture
    }));

    // Calculate the total prize for the entire course
    const totalCoursePrize = lecturesWithPrize.reduce((total, lecture) => total + lecture.totalPrize, 0);

    // Return the lectures with prizes and other details
    return {
      lectures: lecturesWithPrize,
      counts: userCoursesCounts,
      totalCoursePrize, // Add the total prize for the entire course
    };
  }

  ///
  public async findAll_LecturesByCourseId_Ordered(course_id: number, user_id: string): Promise<any> {
    // Group the user courses
    const userCoursesCounts = await this.prisma.userCoursesMapping.groupBy({
      by: ['course_id'],
      _count: {
        start_time: true,
        end_time: true,
      },
      where: { course_id },
    });

    // Fetch completed user lectures
    const completedUserLecture = await this.prisma.userLectureMapping.groupBy({
      by: ['lecture_id'],
      _count: { end_at: true },
      where: { user_id, course_id },
    });

    // Calculate total completed lessons
    const completedLessons = completedUserLecture.reduce((total, lecture) => total + lecture._count.end_at, 0);

    // Fetch the lectures and order them by the 'order' field
    const lectures = await this.lecture.findMany({
      where: { course_id },
      include: {
        course: {
          include: {
            teacher: {
              omit: {
                address: true,
                signature: true,
                message: true,
                createdAt: true,
                isAdmin: true,
                ngc: true,
                game: true,
              },
            },
          },
        },
        question: true, // Includes the questions for each lecture
        userLecture: {
          select: { id: true, lecture_id: true, start_at: true, end_at: true },
          where: { user_id },
        },
      },
      orderBy: {
        order: 'asc', // Specify the order field and direction ('asc' for ascending or 'desc' for descending)
      },
    });

    // Add total prize for each lecture (number of questions * 10)
    const lecturesWithPrize = lectures.map(lecture => ({
      ...lecture,
      totalPrize: lecture.question.length * 10, // Calculate prize based on the number of questions
    }));

    // Calculate the total prize for the whole course
    const totalCoursePrize = lecturesWithPrize.reduce((total, lecture) => total + lecture.totalPrize, 0);

    // Return the ordered lectures with prizes and other details
    return {
      lectures: lecturesWithPrize,
      completedLessons,
      counts: userCoursesCounts,
      totalCoursePrize, // Add the total prize for the entire course
    };
  }

  ////

  public async findAll(course_id: number): Promise<any> {
    const userCoursesCounts = await this.prisma.userCoursesMapping.groupBy({
      by: ['course_id'],
      _count: {
        start_time: true,
        end_time: true,
      },
      where: { course_id },
    });

    const lectures = await this.lecture.findMany({
      where: { course_id },
      include: {
        course: {
          include: { teacher: { omit: { address: true, signature: true, message: true, createdAt: true, isAdmin: true, ngc: true, game: true } } },
        },
        question: true,
        // userLecture: {  select: { id: true, lecture_id: true, start_at: true, end_at: true } },
      },
    });
    return { lectures, counts: userCoursesCounts };
  }

  ///

  // Fetch grouped counts for user courses
  public async findAllWithIdAuthServic(course_id: number, user_id: string): Promise<any> {
    // Group the user courses
    const userCoursesCounts = await this.prisma.userCoursesMapping.groupBy({
      by: ['course_id'],
      _count: {
        start_time: true,
        end_time: true,
      },
      where: { course_id },
    });

    // Fetch completed user lectures
    const completedUserLecture = await this.prisma.userLectureMapping.groupBy({
      by: ['lecture_id'],
      _count: { end_at: true },
      where: { user_id, course_id }, // Ensure it's specific to the course
    });

    // Calculate total completed lessons
    const completedLessons = completedUserLecture.reduce((total, lecture) => total + lecture._count.end_at, 0);

    // Fetch the lectures and order them by the 'order' field
    const lectures = await this.lecture.findMany({
      where: { course_id },
      include: {
        course: {
          include: {
            teacher: {
              omit: {
                address: true,
                signature: true,
                message: true,
                createdAt: true,
                isAdmin: true,
                ngc: true,
                game: true,
              },
            },
          },
        },
        question: true,
        userLecture: {
          select: { id: true, lecture_id: true, start_at: true, end_at: true },
          where: { user_id },
        },
      },
      orderBy: {
        order: 'asc', // Ensure consistent ordering of lectures
      },
    });

    // Calculate total prize for all lectures based on the number of questions
    const questionCounts = await this.prisma.question.groupBy({
      by: ['lecture_id'],
      _count: { id: true },
      where: { lecture_id: { in: lectures.map(lecture => lecture.id) } },
    });

    // Map totalPrize to each lecture
    const totalPrizeData = questionCounts.map(q => ({
      lecture_id: q.lecture_id,
      prize: q._count.id * 10, // Total prize is number of questions * 10
    }));

    const lecturesWithPrize = lectures.map(lecture => {
      const prizeInfo = totalPrizeData.find(t => t.lecture_id === lecture.id);
      return {
        ...lecture,
        totalPrize: prizeInfo ? prizeInfo.prize : 0, // Default to 0 if no questions
      };
    });

    // Aggregate total prize for the entire course
    const totalPrize = totalPrizeData.reduce((sum, t) => sum + t.prize, 0);

    // Return the ordered lectures with prizes and other details
    return {
      lectures: lecturesWithPrize,
      completedLessons,
      counts: userCoursesCounts,
      totalPrize,
    };
  }

  async findOne(id: number, course_id: number): Promise<LectureWithRelations> {
    await this.course.findOne(course_id);
    const lecture = await this.lecture.findUnique({ where: { id }, include: { course: true, question: true, userLecture: true } });
    if (!lecture) {
      throw new HttpException(404, 'Lecture not found');
    }
    return lecture;
  }

  async update(id: number, course_id: number, userId: string, data: UpdateLectureDto, slug: string): Promise<Lecture> {
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
      data: { ...data, slug },
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
