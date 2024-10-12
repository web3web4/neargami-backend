import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller';
import { Service, Container } from 'typedi';
import { Routes } from '@/interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

@Service() // Register this as a service to ensure DI works across the app
export class QuestionRoute implements Routes {
  public router = Router();
  public questionController = Container.get(QuestionController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/questions', AuthMiddleware, this.questionController.create);
    this.router.get('/questions', AuthMiddleware, this.questionController.findAll);
    this.router.get('/questions/:id', AuthMiddleware, this.questionController.findOne);
    this.router.put('/questions/:id', AuthMiddleware, this.questionController.update);
    this.router.delete('/questions/:id', AuthMiddleware, this.questionController.delete);
  }
}
