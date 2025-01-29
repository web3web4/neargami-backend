import { Router } from 'express';
import { LectureController } from '../controllers/lecture.controller';
import { Service, Container } from 'typedi';
import { Routes } from '../interfaces/routes.interface';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ValidationMiddleware } from '../middlewares/validation.middleware';
import { CreateLectureDto, UpdateLectureDto, UpdateLectureOrderArrayDto } from '../dtos/lecture.dto';
import multer from 'multer';


@Service() // Register this as a service to ensure DI works across the app
export class lectureRoute implements Routes {
  public router = Router();
  public lectureController = Container.get(LectureController);

  constructor() {
    this.initializeRoutes();
  }
   storage = multer.memoryStorage()
   upload = multer({ storage: this.storage })

  private initializeRoutes() {
    this.router.get('/courses/lectures/slug/:slug', this.lectureController.findAllLecturesbySlug);
    this.router.get('/courses/lectures/slugAuth/:slug',AuthMiddleware, this.lectureController.findAllLecturesbySlugAuth);
    this.router.get('/courses/lectures/slug', this.lectureController.makeSlugeToAllLectures);
    this.router.post('/upload', this.upload.single('file'), this.lectureController.uploadImage);
    this.router.get('/course/:courseId/lectures', this.lectureController.findAll);
    this.router.get('/course/slug/:slug/lectures', this.lectureController.findAllByCourseSlugWithoutAuth);
    this.router.get('/course/IdAuth/:courseId/lectures',AuthMiddleware, this.lectureController.findAllWithIdAuth);
    this.router.get('/course/slugAuth/:slug/lectures',AuthMiddleware, this.lectureController.findAllByCourseSlug);
    this.router.get('/course/lectures/start/:lecture_id',AuthMiddleware, this.lectureController.checkLectureStart);
    this.router.post(
      '/course/:courseId/lectures',
      AuthMiddleware,
      ValidationMiddleware(CreateLectureDto, false, true, true),
      this.lectureController.create,
    );
    this.router.get('/course/:courseId/lectures/:id', this.lectureController.findOne);
    this.router.put(
      '/course/:courseId/lectures/orders',
      AuthMiddleware,
      ValidationMiddleware(UpdateLectureOrderArrayDto, false, true, true),
      this.lectureController.updateOrders,
    );
    this.router.put(
      '/course/:courseId/lectures/:id',
      AuthMiddleware,
      ValidationMiddleware(UpdateLectureDto, false, true, true),
      this.lectureController.update,
    );
    this.router.delete('/course/:courseId/lectures/:id', AuthMiddleware, this.lectureController.delete);
  }
}

// const router = Router();
// const lectureController = new LectureController();

// router.post("/lectures", lectureController.create);
// router.get("/lectures", lectureController.findAll);
// router.get("/lectures/:id", lectureController.findOne);
// router.put("/lectures/:id", lectureController.update);
// router.delete("/lectures/:id", lectureController.delete);
