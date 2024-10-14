import { Request, Response, NextFunction } from 'express';
import Container, { Service } from 'typedi';
import { CourseService } from '../services/course.service';
import { CreateCourseDto, UpdateCourseDto } from '../dtos/course.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Course } from '@prisma/client';

@Service() // Add this decorator to register CourseController
export class CourseController {
  public courseService = Container.get(CourseService);

  public findAllCourses = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courses: Course[] = await this.courseService.findAll();

      res.status(200).json({ data: courses, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public findTeacherCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const courses: Course[] = await this.courseService.findAllTeacherCourses(id as string);

      res.status(200).json({ data: courses, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public createCourse = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const data: CreateCourseDto = req.body;
    try {
      const { id } = req.user;
      const createdCourse: Course = await this.courseService.createNewCourse(id, data);

      res.status(201).send({ data: createdCourse, message: 'created' });
    } catch (error) {
      res.status(400).json({ error: error.message });
      next(error);
    }
  };
  public findCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const findOneCourseData: Course = await this.courseService.findOne(+id);

      res.status(200).send({ data: findOneCourseData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public updateCourse = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user.id;
    const data: UpdateCourseDto = req.body;
    try {
      const course: Course = await this.courseService.update(+id, userId, data);
      res.status(200).send({ data: course, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public deleteCourse = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const findOneCourseData: Course = await this.courseService.delete(+id, userId);

      res.status(200).send({ data: findOneCourseData, message: 'delete One' });
    } catch (error) {
      next(error);
    }
  };
  // ... Other methods as defined
}
