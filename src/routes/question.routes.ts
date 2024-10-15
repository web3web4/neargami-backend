import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller';
import { Service, Container } from 'typedi';
import { Routes } from '@/interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { CreateQuestionDto, UpdateQuestionDto } from '@/dtos/question.dto';

@Service() // Register this as a service to ensure DI works across the app
export class QuestionRoute implements Routes {
  public router = Router();
  public questionController = Container.get(QuestionController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/course/:courseId/lecture/:lectureId/questions',
      AuthMiddleware,
      ValidationMiddleware(CreateQuestionDto, false, true, true),
      this.questionController.create,
    );
    this.router.get('/course/:courseId/lecture/:lectureId/questions', AuthMiddleware, this.questionController.findAll);
    this.router.get('/course/:courseId/lecture/:lectureId/questions/:id', AuthMiddleware, this.questionController.findOne);
    this.router.put(
      '/course/:courseId/lecture/:lectureId/questions/:id',
      AuthMiddleware,
      ValidationMiddleware(UpdateQuestionDto, false, true, true),
      this.questionController.update,
    );
    this.router.delete('/course/:courseId/lecture/:lectureId/questions/:id', AuthMiddleware, this.questionController.delete);
  }
}
