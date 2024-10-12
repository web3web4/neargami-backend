import { PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import { SECRET_KEY } from '@/config';
import { verify } from 'jsonwebtoken';

const getAuthorization = (req: RequestWithUser) => {
  const coockie = req.cookies['Authorization'];
  if (coockie) return coockie;

  const header = req.headers['authorization'];
  if (header) return header.split('Bearer ')[1];

  return null;
};

const prisma = new PrismaClient();

export const CheckCourseTeacher = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = getAuthorization(req);
    const { id } = (await verify(Authorization, SECRET_KEY)) as DataStoredInToken;
    const lectureId = req.params.id;
    const coursebody_id = req.body.course_id;
    const checkUser_course_id = await prisma.course.findUnique({ where: { id: coursebody_id } });

    // Fetch course details
    const lecture = await prisma.lecture.findUnique({
      where: { id: Number(lectureId) },
    });

    if (!lecture) {
      return next(new HttpException(404, 'lecture not found'));
    }
    const course = await prisma.course.findUnique({ where: { id: lecture.course_id } });
    // Compare lecture-course-teacher-id with authenticated user ID
    if (course.teacher_user_id === id) {
      if (checkUser_course_id.teacher_user_id === id) {
        next();
      } else {
        next(new HttpException(403, 'you are not the user who add this course '));
      }
      // Authorized, proceed with the request
    } else {
      next(new HttpException(403, 'You are not authorized to update this Lecture'));
    }
  } catch (error) {
    next(new HttpException(500, 'Internal Server Error'));
  }
};
