import { Request, Response, NextFunction } from 'express';
import Container, { Service } from 'typedi';
import { CourseService } from '../services/course.service';
import { CreateCourseDto, Status, UpdateCourseDto } from '../dtos/course.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
import { Course } from '@prisma/client';

@Service() // Add this decorator to register CourseController
export class CourseController {
  public courseService = Container.get(CourseService);
 
  public findAllCoursesPage = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 10 } = req.query; // Extract page and limit from query parameters
      const pageNumber = Math.max(1, parseInt(page as string, 10)); // Ensure page is a positive integer
      const limitNumber = Math.max(1, parseInt(limit as string, 10)); // Ensure limit is a positive integer

      // Calculate offset for pagination
      const offset = (pageNumber - 1) * limitNumber;

      // Fetch courses with pagination
      const courses: Course[] = await this.courseService.findAllPage({ offset, limit: limitNumber });

      // Fetch total count for calculating total pages
      const totalCourses: number = await this.courseService.countAll();
      const totalPages = Math.ceil(totalCourses / limitNumber);

      res.status(200).json({
        data: courses,
        meta: {
          totalItems: totalCourses,
          totalPages,
          currentPage: pageNumber,
          itemsPerPage: limitNumber,
        },
        message: 'findAll with pagination',
      });
    } catch (error) {
      next(error);
    }
  };

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
  public findCoursesByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const courses: Course[] = await this.courseService.findAllCoursesByStatus(id as Status);
      res.status(200).json({ data: courses, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public findCourseBySlug = async(req: Request,res:Response,next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;

      const courses: Course = await this.courseService.findUniqueCourseBySlug(slug);
      res.status(200).json({ data: courses, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  // public findTeacherCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { id } = req.params;
  //     const courses: Course[] = await this.courseService.findAllTeacherCourses(id as string);

  //     res.status(200).json({ data: courses, message: 'findAll' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  public findCoursesByTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tag } = req.params;

      const courses: Course[] = await this.courseService.findAllByTag(tag);

      res.status(200).json({ data: courses, message: `findAll courses by tag: ${tag} ` });
    } catch (error) {
      next(error);
    }
  };
  public findCoursesByTextSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phras } = req.params;

      const courses: Course[] = await this.courseService.findAllByTextSearch(phras);

      res.status(200).json({ data: courses, message: `findAll courses about : ${phras} ` });
    } catch (error) {
      next(error);
    }
  };
  public findCoursesBySubTextSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phras } = req.params;

      const courses: Course[] = await this.courseService.findAllBySubTextSearch(phras);

      res.status(200).json({ data: courses, message: `findAll courses about : ${phras} ` });
    } catch (error) {
      next(error);
    }
  };

public getLastId=async()=>{
  const id= await this.courseService.getLastUserId();
return id;
}
public getId=async(uid:number)=>{
  const id= await this.courseService.getUserId(uid);
return id;
}
  public stringToSlugById=async(title: string,id:number) => {
    const baseSlug = title
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  
    const uniqueSuffix = await this.getId(id);// Use timestamp for uniqueness
    return `${baseSlug}-${uniqueSuffix}`;
  }
  public stringToSlug=async(title: string) => {
    const baseSlug = title
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  
    const uniqueSuffix = await this.getLastId();// Use timestamp for uniqueness
    return `${baseSlug}-${uniqueSuffix}`;
  }
  public createCourse = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
     const data: CreateCourseDto = req.body;
   //const data: Course = req.body;//with uuid
   const sluge = await this.stringToSlug(data.title);
   const teacher_user_id=req.user.id;
  // const teacher_user_id="a4aebc8f-d5c3-47f7-97f2-6fa0731975bc";
    try {
    
      const createdCourse: Course = await this.courseService.createNewCourse(teacher_user_id, data,sluge);

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
    const courseinfo: Course =await this.courseService.findUniqueByTitle(+id);
    const sluge=await this.stringToSlugById(courseinfo.title,+id);
   
    try {
      const course: Course = await this.courseService.update(+id, userId, data,sluge);
      res.status(200).send({ data: course, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public updateCourseStatus = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
   const isAdmin =true;
   // req.user.isAdmin;
   
    const publish_status: Status = req.body.publish_status;
    const publish_status_reson: string = req.body.publish_status_reson;
    const courseinfo: Course =await this.courseService.findUniqueByTitle(+id);
    const sluge=await this.stringToSlugById(courseinfo.title,+id);
    try {
      const course: Course = await this.courseService.updateStatus(+id, isAdmin, publish_status, publish_status_reson,sluge);

      res.status(200).send({ data: course, message: 'status updated' });
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
