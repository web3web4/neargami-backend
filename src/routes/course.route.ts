import { CourseController } from '@/controllers/course.controller';
import { CreateCourseDto, UpdateCourseDto } from '@/dtos/courses.dto';
import { Routes } from '@/interfaces/routes.interface';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { Router } from 'express';

export class CourseRoute implements Routes {
  public path = '/courses';
  public router = Router();
  public course = new CourseController();
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(`${this.path}`, this.course.getCourses);
    this.router.get(`${this.path}/:id(\\d+)`, this.course.getCourseById);
    this.router.post(`${this.path}`, ValidationMiddleware(CreateCourseDto), this.course.createCourse);
    this.router.put(`${this.path}/:id(\\d+)`, ValidationMiddleware(UpdateCourseDto, true), this.course.upadteCourse);
    this.router.delete(`${this.path}/:id(\\d+)`, this.course.deleteCourse);
  }
}
