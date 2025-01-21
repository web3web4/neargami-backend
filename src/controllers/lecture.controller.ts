import { NextFunction, Request, Response } from 'express';
import { LectureService } from '../services/lecture.service';
import { CreateLectureDto, UpdateLectureDto, UpdateLectureOrderArrayDto } from '../dtos/lecture.dto';
import Container, { Service } from 'typedi';
import { RequestWithUser } from '../interfaces/auth.interface';
import { Course, Lecture, UserLectureMapping } from '@prisma/client';
import { CourseService } from '@/services/course.service';

@Service()
export class LectureController {
  public lectureService = Container.get(LectureService);



  public findAllLecturesbySlug=async(req:RequestWithUser,res:Response,next:NextFunction)=>{
const {slug}=req.params;
    try{
      const Lectures=await this.lectureService.findAllLEcturesBySlug(slug);
      res.status(200).json({ data: Lectures, message: 'Lecture with Slug' });
      } catch (error) {
            next(error);
          }
        };
  public findAllLecturesbySlugAuth=async(req:RequestWithUser,res:Response,next:NextFunction)=>{
          const {slug}=req.params;
          const {id}=req.user;
              try{
                const Lectures=await this.lectureService.findAllLEcturesBySlugAuth(slug,id);
                res.status(200).json({ data: Lectures, message: 'Lecture with Slug auth' });
                } catch (error) {
                      next(error);
                    }
                  }
                
              
    
  public makeSlugeToAllLectures=async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> =>{
    try{
    const Lectures=await this.lectureService.updateForAllSlug();
    res.status(200).json({ data: Lectures, message: 'All Lectures Have Slug' });
    } catch (error) {
          next(error);
        }
      }
    
    
public checkLectureStart = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  const {id:user_id}=req.user;
  const {lecture_id}=req.params;
try{
  const lecture =await this.lectureService.checkLectureStart(user_id,+lecture_id);
 
  if (lecture !==null){
    res.status(200).send({ data: lecture, message: 'this lecture has been started befor' });
  }else{
    res.status(200).send({ data: lecture, message: 'this is first time with this lecture' });
  }
  
} catch (error) {
next(error);
}

}


  public uploadImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Assuming the image file is sent as a 'file' field in the request
      const file = req.file; // Use middleware like multer for handling file uploads
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
      }

      const fileName = file.originalname; // Use the original file name
      const response = await this.lectureService.uploadImageToImageKit(file.path, fileName);
      res.status(200).json({ success: true, data: response });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
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
  public getLastId = async () => {
    const id = await this.lectureService.getLastUserId();
    return id;
  };
 

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const createLectureDto: CreateLectureDto = req.body;
    const sluge = await this.stringToSlug(createLectureDto.title);
    const { courseId } = req.params;
    const { id } = req.user;
    try {
      const lecture = await this.lectureService.create(id, +courseId, createLectureDto,sluge);
      res.status(201).send({ data: lecture, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  /////////////////find lectures of course by slug without auth/////////////////////////////////////////


  public findAllByCourseSlugWithoutAuth= async (req: Request, res: Response, next: NextFunction)=>{
    try{
    const { slug }=req.params;
   
    const course: Course =await this.lectureService.findUniqueCourseBySlug(slug) ;
    
    const id:number=course.id;
    
     const lectures: Lecture[] = await this.lectureService.findAll_LecturesByCourseId(id);
    
    res.status(200).send({ data: lectures, message: 'findAll Lectures by course slug' });
    } catch (error) {
    next(error);
    }
    
    }

  //////////////////  find lectures of course by slug ordered by order number with auth////////
public findAllByCourseSlug= async (req: RequestWithUser, res: Response, next: NextFunction)=>{
try{
const { slug }=req.params;
const {id:userId}=req.user

const course: Course =await this.lectureService.findUniqueCourseBySlug(slug) ;

const id:number=course.id;

 const lectures: Lecture[] = await this.lectureService.findAll_LecturesByCourseId_Ordered(id,userId);

res.status(200).send({ data: lectures, message: 'findAll Lectures by course slug' });
} catch (error) {
next(error);
}

}
////find all lectures of courses by course ID without Auth

public findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
   // const { id: userId } = req.user;
    const lectures: Lecture[] = await this.lectureService.findAll( +courseId);

    res.status(200).send({ data: lectures, message: 'findAll' });
  } catch (error) {
    next(error);
  }
};








//////find all lectures of courses by course ID with Auth /////////////////////////////
  public findAllWithIdAuth = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {

    try {
      const { courseId } = req.params;
      const { id: userId } = req.user;
      const lectures: Lecture[] = await this.lectureService.findAllWithIdAuthServic( +courseId,userId);

      res.status(200).send({ data: lectures, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { courseId } = req.params;
    try {
      const lecture: Lecture = await this.lectureService.findOne(+id, +courseId);

      res.status(200).send({ data: lecture, message: 'found' });
    } catch (error) {
      next(error);
    }
  };
  public getId = async (uid: number) => {
    const id = await this.lectureService.getUserId(uid);
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
  public update = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id, courseId } = req.params;
    const userId = req.user.id;
    const data: UpdateLectureDto = req.body;
    
   const slug = await this.stringToSlugById(data.title, +id);
    try {
      const lecture = await this.lectureService.update(+id, +courseId, userId, data,slug);
      res.status(200).send({ data: lecture, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public updateOrders = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { courseId } = req.params;
    const userId = req.user.id;
    const data: UpdateLectureOrderArrayDto = req.body;
    
    try {
      const lectures = await this.lectureService.updateOrders(+courseId, userId, data);
      res.status(200).send({ data: lectures, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id, courseId } = req.params;
    const userId = req.user.id;
    try {
      const lecture = await this.lectureService.delete(+id, +courseId, userId);
      res.status(200).send({ data: lecture, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
