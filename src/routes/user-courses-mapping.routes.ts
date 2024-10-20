import { Router } from 'express';
import { UserCoursesMappingController } from '../controllers/user-courses-mapping.controller';
import { Service, Container } from 'typedi';
import { Routes } from '@/interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

@Service()
export class UserCoursesMapping implements Routes {
  public router = Router();
  public userCoursesMappingController = Container.get(UserCoursesMappingController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/user-courses/', AuthMiddleware, this.userCoursesMappingController.findAll);
    this.router.post('/user-courses/start/:id', AuthMiddleware, this.userCoursesMappingController.register);
    this.router.put('/user-courses/finish/:id', AuthMiddleware, this.userCoursesMappingController.finsih);
    // this.router.get('/user-courses-mappings/:id', AuthMiddleware, this.userCoursesMappingController.findOne);
    // this.router.put('/user-courses-mappings/:id', AuthMiddleware, this.userCoursesMappingController.update);
    // this.router.delete('/user-courses-mappings/:id', AuthMiddleware, this.userCoursesMappingController.delete);
  }
}
