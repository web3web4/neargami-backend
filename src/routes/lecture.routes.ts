import { Router } from 'express';
import { LectureController } from '../controllers/lecture.controller';
import { Service, Container } from 'typedi';
import { Routes } from '@/interfaces/routes.interface';
import { CheckCourseTeacher } from '@/middlewares/lecture-course-teacher.middleware';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

@Service() // Register this as a service to ensure DI works across the app
export class lectureRoute implements Routes {
  public router = Router();
  public lectureController = Container.get(LectureController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/lectures', this.lectureController.findAll);
    this.router.post('/lectures', AuthMiddleware, CheckCourseTeacher, this.lectureController.create);
    this.router.get('/lectures/:id', AuthMiddleware, this.lectureController.findOne);
    this.router.put('/lectures/:id', AuthMiddleware, CheckCourseTeacher, this.lectureController.update);
    this.router.delete('/lectures/:id', AuthMiddleware, this.lectureController.delete);
  }
}

// const router = Router();
// const lectureController = new LectureController();

// router.post("/lectures", lectureController.create);
// router.get("/lectures", lectureController.findAll);
// router.get("/lectures/:id", lectureController.findOne);
// router.put("/lectures/:id", lectureController.update);
// router.delete("/lectures/:id", lectureController.delete);
