import { Request, Response, NextFunction } from 'express';
import { Inject, Service } from 'typedi';
import { CourseService } from '../services/course.service';
import { ICourse } from '@/interfaces/course.interface';
import { Status, UpdateCourseDto } from '../dtos/course.dto';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { RequestWithUser } from '@/interfaces/auth.interface';

@Service() // Add this decorator to register CourseController
export class CourseController {
  constructor(@Inject(() => CourseService) private courseService: CourseService) {
    console.log('CourseController initialized');
  }

  public findAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {
      const findAllCoursesData: ICourse[] = await this.courseService.findAll();
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
    const data: ICourse = req.body;
    const publishStatus: Status = req.body.publish_status;

    try {
      const createCourse: ICourse = await this.courseService.createNewCourse(data);
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
      const findOneCourseData: ICourse = await this.courseService.findOne(coursId);

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
        .send(JSON.stringify({ data: course, message: 'created' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  public deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const coursId = BigInt(req.params.id);
      const findOneCourseData: ICourse = await this.courseService.delete(coursId);

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
