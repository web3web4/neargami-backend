import { Router } from 'express';
import { UserLectureMappingController } from '../controllers/user-lecture-mapping.controller';
import { Service, Container } from 'typedi';
import { Routes } from '@/interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

@Service()
export class UserLecturesMapping implements Routes {
  public router = Router();
  public userLectureMappingController = Container.get(UserLectureMappingController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/user-lectures/course/:courseId', AuthMiddleware, this.userLectureMappingController.findAll);
    this.router.post('/user-lectures/course/:courseId/start/:id', AuthMiddleware, this.userLectureMappingController.register);
    this.router.put('/user-lectures/course/:courseId/finish/:id', AuthMiddleware, this.userLectureMappingController.finish);
    this.router.post(
      '/user-lectures/course/:courseId/answser/:lectureId/question/:questionId',
      AuthMiddleware,
      this.userLectureMappingController.answer,
    );
    // this.router.get("/user-lecture-mappings/:id", this.userLectureMappingController.findOne);
    // this.router.put("/user-lecture-mappings/:id", this.userLectureMappingController.update);
    // this.router.delete("/user-lecture-mappings/:id", this.userLectureMappingController.delete);
  }
}
