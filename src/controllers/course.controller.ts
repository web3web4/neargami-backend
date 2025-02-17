import { Request, Response, NextFunction } from 'express';
import Container, { Service } from 'typedi';
import { CourseService } from '../services/course.service';
import { CreateCourseDto, Status, UpdateCourseDto } from '../dtos/course.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
import { Course, Lecture, Question } from '@prisma/client';
import { LectureService } from '@/services/lecture.service';
import { CreateLectureDto } from '@/dtos/lecture.dto';

@Service() // Add this decorator to register CourseController
export class CourseController {
  public courseService = Container.get(CourseService);
  public findUsersStartingCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const AllCourses = await this.courseService.getAllUsersStartingCourse(+id);
      res.status(200).json({ data: AllCourses, message: 'All Users witch starting with this course' });
    } catch (error) {
      next(error);
    }
  };

  public makeAllCoursesHaveSlug = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const AllCourses = await this.courseService.updateForAllSlug();
      res.status(200).json({ data: AllCourses, message: 'All Courses Have Slug' });
    } catch (error) {
      next(error);
    }
  };

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
  public findAllCoursesWithAuth = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.user;
    try {
      const courses: Course[] = await this.courseService.findAllWithAuth(id);

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
  public findCourseBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  public getLastId = async () => {
    const id = await this.courseService.getLastUserId();
    return id;
  };
  public getId = async (uid: number) => {
    const id = await this.courseService.getUserId(uid);
    return id;
  };
  public stringToSlugById = async (title: string, id: number) => {
    const baseSlug = title
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

    const uniqueSuffix = await this.getId(id); // Use timestamp for uniqueness
    return `${baseSlug}-${uniqueSuffix}`;
  };
  public stringToSlugByIdforLectureVersion = async (title: string, id: number) => {
    const baseSlug = title
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

    const uniqueSuffix =id; // Use timestamp for uniqueness
    return `${baseSlug}-${uniqueSuffix}`;
  };
  public stringToSlug = async (title: string) => {
    const baseSlug = title
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

    const uniqueSuffix = await this.getLastId(); // Use timestamp for uniqueness
    return `${baseSlug}-${uniqueSuffix}`;
  };
  public createCourse = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const data: CreateCourseDto = req.body;
    //const data: Course = req.body;//with uuid
    const sluge = await this.stringToSlug(data.title);
    const teacher_user_id = req.user.id;
    // const teacher_user_id="a4aebc8f-d5c3-47f7-97f2-6fa0731975bc";
    try {
      const createdCourse: Course = await this.courseService.createNewCourse(teacher_user_id, data, sluge);
      if(createdCourse.parent_version_id==null){const correctCourse=await this.courseService.related_createNewCourse(createdCourse.id);
        
        res.status(201).send({ data: correctCourse, message: 'created' })
      }else
      {res.status(201).send({ data: createdCourse, message: 'created' });}
    } catch (error) {
      res.status(400).json({ error: error.message });
      next(error);
    }
  };



  public createNewCourseVersion=async(req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  const {id}=req.params;
  const {id:userId}=req.user;


  const prevCourse=await this.courseService.findOneCourse(+id);
  const lectures = prevCourse["lecture"] || []; // Ensure it's an array
  const questions = lectures.flatMap(l => l.question || []); // Extract questions
  const userLectures = lectures.flatMap(l => l.userLecture || []); // Extract userlectures
  const answers=questions.flatMap(l=>l.answer||[]);
  const userCourses=prevCourse["userCourses"];
  const userQuestionAnswers=prevCourse["UserQuestionAnswer"];

  const newcourse = { ...prevCourse }; // Clone previous course data
  const courseSluge = await this.stringToSlug(newcourse.title);
  //const lectureSlug= lectures.map((lecture)=>{})
    try {
    const newVersionCourse = await this.courseService.createNewVersion(+id,newcourse,userId,courseSluge)
    const newLectureswithNewIds =await this.courseService.createLectureVersion(userId,+newVersionCourse.id,lectures);
    const {createdQuestions,createdAnswers}=await this.courseService.creatnewLectureQuestion(questions,lectures,newLectureswithNewIds,answers);
    const userLecture=await this.courseService.creatnewUserLecture(+newVersionCourse.id,userLectures,lectures,newLectureswithNewIds);
   // const answersQuestions=await this.courseService.creatnewAnswersQuestion(answers,questions,lectureQuestions);
    
    newLectureswithNewIds.map(async(newLectureswithNewId)=>{
    const slug=await this.stringToSlugByIdforLectureVersion(newLectureswithNewId.title,newLectureswithNewId.id);
    const updatlectuers=await this.courseService.updateLecture(+newLectureswithNewId.id,slug);
    
    });
   const newUserQuestionAnswers=await this.courseService.creatnewUserAnswersQuestion(+newcourse.id,userQuestionAnswers,
    lectures,newLectureswithNewIds,questions,createdQuestions)
    const newUserCourses=await this.courseService.creatnewUserCourse(+newVersionCourse.id,userCourses);
      res.status(200).send({ data:newVersionCourse,newUserCourses,userLecture,
        createdQuestions,createdAnswers,newUserQuestionAnswers,
        
         message: 'A new version created ' });
    } catch (error) {
      next(error);
    }

  }
public getAllChangesBetweenVersions=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
const {id}=req.params;
try{
  const {lectures,questions,answers,userCourses,userAnsweres}=await this.courseService.getAllChangesById(+id);
  res.status(200).send({data:lectures,questions,answers,userCourses,userAnsweres,message:'this is deferences '})
}
catch(error){next(error)}
}



  public  changeCourseStatusFromDraftToPending=async(req: RequestWithUser, res: Response, next: NextFunction):Promise<void>=>{
    const {id}=req.params;
    const {id:userId}=req.user;
    try{

const pendingCourse=await this.courseService.changeStatusFromDraftToPending(+id,userId);

res.status(200).send({data:pendingCourse,message:'course is pending'});


    }catch(error){next(error)}
  }


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
    const courseinfo: Course = await this.courseService.findUniqueByTitle(+id);
    const sluge = await this.stringToSlugById(courseinfo.title, +id);

    try {
      const course: Course = await this.courseService.update(+id, userId, data, sluge);
      res.status(200).send({ data: course, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public updateCourseStatus = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const user = req.user;
    // req.user.isAdmin;

    const publish_status: Status = req.body.publish_status;
    const publish_status_reson: string = req.body.publish_status_reson;
    const courseinfo: Course = await this.courseService.findUniqueByTitle(+id);
    const sluge = await this.stringToSlugById(courseinfo.title, +id);
    try {
      const course: Course = await this.courseService.updateStatus(+id, user.isAdmin, publish_status, publish_status_reson, sluge);

      res.status(200).send({ data: course, message: 'status updated' });
    } catch (error) {
      next(error);
    }
  };

    // add prev status to log for admin users
    public makeLogStatusForAdminUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
      const { id } = req.params;
      const user = req.user;
      // req.user.isAdmin;
  
      const publish_status: Status = req.body.publish_status;
      const publish_status_reson: string = req.body.publish_status_reson;
      const courseinfo: Course = await this.courseService.findUniqueByTitle(+id);
      const sluge = await this.stringToSlugById(courseinfo.title, +id);
      const prevStatus = courseinfo.publish_status;
      try {
        const course: Course = await this.courseService.updateLogStatusForAdmin(+id, user.isAdmin,user.id, publish_status, publish_status_reson, sluge,prevStatus);
  
        res.status(200).send({ data: course, message: 'status updated and logged ' });
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

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req.query;
      const searchResult = await this.courseService.search(query as string);
      res.status(200).send({ data: searchResult, message: 'search' });
    } catch (error) {
      next(error);
    }
  };

  public getKeywords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const keywords = await this.courseService.getKeywords();
      res.status(200).send({ data: keywords, message: 'keywords' });
    } catch (error) {
      next(error);
    }
  };

}
