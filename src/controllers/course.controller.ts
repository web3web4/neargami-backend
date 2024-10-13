import { Request, Response, NextFunction } from 'express';
import { Inject, Service } from 'typedi';
import { CourseService } from '../services/course.service';
import { ICourse, ICoursefull, ICoursewithoutUserId } from '@/interfaces/course.interface';
import { Status, UpdateCourseDto } from '../dtos/course.dto';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { DataStoredInToken, RequestWithUser } from '@/interfaces/auth.interface';
import { SECRET_KEY } from '@/config';
import { verify } from 'jsonwebtoken';
import { Course } from '@prisma/client';

@Service() // Add this decorator to register CourseController
export class CourseController {
  constructor(@Inject(() => CourseService) private courseService: CourseService) {
    console.log('CourseController initialized');
  }
  public getAuthorization = (req: Request) => {
    const coockie = req.cookies['Authorization'];
    if (coockie) return coockie;

    const header = req.headers['authorization'];
    if (header) return header.split('Bearer ')[1];

    return null;
  };

  public findMyAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const Authorization = this.getAuthorization(req);
      const { id } = (await verify(Authorization, SECRET_KEY)) as DataStoredInToken;
      const findAllCoursesData: ICoursefull[] = await this.courseService.findAll(id);
      // Convert any BigInt fields to strings
      const processedCourses = findAllCoursesData.map(course => ({
        ...course,
        id: course.id.toString(), // Assuming 'id' is a BigInt field
      }));

      res.status(200).json({ data: processedCourses, message: 'findAll' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  public findAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {

      const findAllCoursesData: ICoursefull[] = await this.courseService.findAllCourses();
      // Convert any BigInt fields to strings
      const processedCourses = findAllCoursesData.map(course => ({
        ...course,
        id: course.id.toString(), // Assuming 'id' is a BigInt field
      }));

      res.status(200).json({ data: processedCourses, message: 'findAll' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  public createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data1: ICoursewithoutUserId = req.body;
    try {
      const Authorization = this.getAuthorization(req);
      const { id } = (await verify(Authorization, SECRET_KEY)) as DataStoredInToken;
      const data: ICourse = { icoursewithoutUserId: data1, teacher_user_id: id };
      const createCourse: Course = await this.courseService.createNewCourse(data);
      // Use custom JSON stringify function to handle BigInt
      res
        .status(200)
        .send(JSON.stringify({ data: createCourse, message: 'created' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
      //res.status(201).json({ data: createCourse, message: "created" });
    } catch (error) {
      res.status(400).json({ error: error.message });
      next(error);
    }
  };
  public findCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coursId = BigInt(req.params.id);
      const findOneCourseData: ICoursefull = await this.courseService.findOne(coursId);

      res
        .status(200)
        .send(
          JSON.stringify({ data: findOneCourseData, message: 'findOne' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
        );
    } catch (error) {
      next(error);
    }
  };
  public updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = BigInt(req.params.id);

    const data: UpdateCourseDto = req.body;
    try {
      const course = await this.courseService.update(id, data);
      res
        .status(200)
        .send(JSON.stringify({ data: course, message: 'updated' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  public deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coursId = BigInt(req.params.id);
      const findOneCourseData: ICoursefull = await this.courseService.delete(coursId);

      res
        .status(200)
        .send(
          JSON.stringify({ data: findOneCourseData, message: 'delete One' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
        );
    } catch (error) {
      next(error);
    }
  };
  // ... Other methods as defined
}
