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
    const courseId = req.params.id;

    // Fetch course details
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });

    if (!course) {
      return next(new HttpException(404, 'Course not found'));
    }

    // Compare course-teacher-id with authenticated user ID
    if (course.teacher_user_id === id) {
      next(); // Authorized, proceed with the request
    } else {
      next(new HttpException(403, 'You are not authorized to update this course'));
    }
  } catch (error) {
    next(new HttpException(500, 'Internal Server Error'));
  }
};
