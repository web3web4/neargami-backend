import { CreateCourseDto, UpdateCourseDto } from '@/dtos/courses.dto';
import { Course } from '@/interfaces/course.interfact';
import { CourseService } from '@/services/course.service';
import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';

export class CourseController {
  public course = Container.get(CourseService);

  public getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllCoursesData: Course[] = await this.course.findAllCourse();
      res.status(200).json({ data: findAllCoursesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseId = Number(req.params.id);
      const findOneCourseData: Course = await this.course.findCourseById(courseId);
      res.status(200).json({ data: findOneCourseData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseData: CreateCourseDto = req.body;
      const createCourseData: Course = await this.course.createCourse(courseData);

      res.status(201).json({ data: createCourseData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public upadteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseId = Number(req.params.id);
      const courseData: UpdateCourseDto = req.body;
      const updateCourseData: Course = await this.course.updateCourse(courseId, courseData);

      res.status(200).json({ data: updateCourseData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseId = Number(req.params.id);
      const deleteCourseData: Course = await this.course.deleteCourse(courseId);

      res.status(200).json({ data: deleteCourseData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
