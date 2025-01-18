import { NextFunction, Request, Response } from 'express';
import { LectureService } from '../services/lecture.service';
import { CreateLectureDto, UpdateLectureDto, UpdateLectureOrderArrayDto } from '../dtos/lecture.dto';
import Container, { Service } from 'typedi';
import { RequestWithUser } from '../interfaces/auth.interface';
import { Course, Lecture } from '@prisma/client';
import { CourseService } from '@/services/course.service';

@Service()
export class LectureController {
  
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


  public lectureService = Container.get(LectureService);

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const createLectureDto: CreateLectureDto = req.body;
    const { courseId } = req.params;
    const { id } = req.user;
    try {
      const lecture = await this.lectureService.create(id, +courseId, createLectureDto);
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

  public update = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id, courseId } = req.params;
    const userId = req.user.id;
    const data: UpdateLectureDto = req.body;
    try {
      const lecture = await this.lectureService.update(+id, +courseId, userId, data);
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
