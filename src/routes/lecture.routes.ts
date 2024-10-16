import { Router } from 'express';
import { LectureController } from '../controllers/lecture.controller';
import { Service, Container } from 'typedi';
import { Routes } from '@/interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { CreateLectureDto, UpdateLectureDto, UpdateLectureOrderArrayDto } from '@/dtos/lecture.dto';

@Service() // Register this as a service to ensure DI works across the app
export class lectureRoute implements Routes {
  public router = Router();
  public lectureController = Container.get(LectureController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/course/:courseId/lectures', AuthMiddleware, this.lectureController.findAll);
    this.router.post(
      '/course/:courseId/lectures',
      AuthMiddleware,
      ValidationMiddleware(CreateLectureDto, false, true, true),
      this.lectureController.create,
    );
    this.router.get('/course/:courseId/lectures/:id', AuthMiddleware, this.lectureController.findOne);
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
