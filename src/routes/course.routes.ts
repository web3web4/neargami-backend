import { CourseController } from '@/controllers/course.controller';
import { CreateCourseDto, UpdateCourseDto } from '@/dtos/course.dto';
import { Routes } from '@/interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { CheckCourseTeacher } from '@/middlewares/course-teacher.middleware';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { Router } from 'express';
import { Service, Container } from 'typedi';

@Service() // Register this as a service to ensure DI works across the app
export class CourseRoute implements Routes {
  public router = Router();
  public courseController = Container.get(CourseController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/courses', AuthMiddleware, this.courseController.findAllCourses);
    this.router.get('/courses/teacher/:id', AuthMiddleware, this.courseController.findTeacherCourses);
    this.router.post('/courses', AuthMiddleware, ValidationMiddleware(CreateCourseDto, false, true, true), this.courseController.createCourse);
    this.router.get('/courses/:id', AuthMiddleware, this.courseController.findCourseById);
    this.router.put('/courses/:id', AuthMiddleware, ValidationMiddleware(UpdateCourseDto, false, true, true), this.courseController.updateCourse);
    this.router.delete('/courses/:id', AuthMiddleware, this.courseController.deleteCourse);
  }
}
