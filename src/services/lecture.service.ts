import { Lecture } from '@prisma/client';
import { CreateLectureDto, UpdateLectureDto, UpdateLectureOrderArrayDto } from '../dtos/lecture.dto';
import Container, { Service } from 'typedi';
import { CourseService } from './course.service';
import { HttpException } from '../exceptions/HttpException';
import { LectureWithRelations } from '../interfaces/lecture.interface';
import { PrismaService } from './prisma.service';
import ImageKit from 'imagekit';
import fs from 'fs';
import { count } from 'console';

// const imagekit = new ImageKit({
//   publicKey: 'public_UwYz1I2ID7IZOXNoogcH+wJvwn0=',
//   privateKey: 'private_msO5wyd+ECoSS/Ua4K5kL+NCzOc=',
//   urlEndpoint: 'https://ik.imagekit.io/lybbxavs0',
// });
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});
@Service()
export class LectureService {
  private prismaService = Container.get(PrismaService);
  private lecture = this.prismaService.lecture;
  private course = Container.get(CourseService);
  private prisma = this.prismaService.prisma;
  async create(userId: string, course_id: number, createLectureDto: CreateLectureDto): Promise<Lecture> {
    const course = await this.course.findOne(course_id);
    if (course.teacher_user_id !== userId) {
      throw new HttpException(403, 'Forbidden');
    }
    return this.lecture.create({ data: { course_id, ...createLectureDto } });
  }
  async uploadImageToImageKit(filePath: string, fileName: string): Promise<string> {
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
async findUniqueCourseBySlug(slug:string):Promise<any>{
return await this.prismaService.course.findFirst({where:{slug}});
//await this.prisma.lecture.findMany({include:{course:{}}})


}
///

public async findAll_LecturesByCourseId( course_id: number): Promise<any> {
  // await this.course.findOne(course_id);
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
       //question: true,
      //  userLecture: {  select: { id: true, lecture_id: true, start_at: true, end_at: true } },
     },
   });
   return { lectures };
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
    where: { user_id },
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

  // Add total prize to each lecture (number of questions * 10)
  const lecturesWithPrize = lectures.map((lecture) => ({
    ...lecture,
    totalPrize: lecture.question.length * 10, // Calculate prize based on the number of questions
  }));

  // Return the ordered lectures with prizes and other details
  return {
    lectures: lecturesWithPrize,
    completedLessons,
    counts: userCoursesCounts,
  };
}

////


public async findAll( course_id: number): Promise<any> {
  // await this.course.findOne(course_id);
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
public async findAllWithIdAuthServic(course_id: number, user_id: string): Promise<any> {
  // Fetch grouped counts for user courses
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
    where: { user_id },
  });

  // Fetch lectures with related data
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
  });

  // Group questions by lecture_id to count questions
  const questionCounts = await this.prisma.question.groupBy({
    by: ['lecture_id'],
    _count: { id: true },
  });

  // Calculate totalPrize for each lecture
  const totalPrize = questionCounts.map((q) => ({
    lecture_id: q.lecture_id,
    prize: q._count.id * 10, // Prize = number of questions * 10
  }));

  // Merge totalPrize into lectures
  const lecturesWithPrize = lectures.map((lecture) => {
    const prizeInfo = totalPrize.find((t) => t.lecture_id === lecture.id);
    return {
      ...lecture,
      totalPrize: prizeInfo ? prizeInfo.prize : 0, // If no questions, totalPrize = 0
    };
  });

  // Return the final response
  return {
    lectures: lecturesWithPrize,
    counts: userCoursesCounts,
    completedLessons: completedUserLecture,
   
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
