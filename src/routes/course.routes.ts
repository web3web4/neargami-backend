import { CourseController } from '@/controllers/course.controller';
import { Routes } from '@/interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { CheckCourseTeacher } from '@/middlewares/course-teacher.middleware';
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
    this.router.post('/courses', AuthMiddleware, this.courseController.createCourse);
    this.router.get('/courses/:id', AuthMiddleware, this.courseController.findCourseById);
    this.router.put('/courses/:id', AuthMiddleware, CheckCourseTeacher, this.courseController.updateCourse);
    this.router.delete('/courses/:id', AuthMiddleware, this.courseController.deleteCourse);
  }
}
