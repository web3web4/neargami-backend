import { Router } from 'express';
import { AnswerController } from '../controllers/answer.controller';
import { Service, Container } from 'typedi';
import { Routes } from '@/interfaces/routes.interface';
import { ClaimsController } from '@/controllers/claims.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

@Service() // Register this as a service to ensure DI works across the app
export class ClaimsRoute implements Routes {
  public router = Router();
  public claimsController = Container.get(ClaimsController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/lkajsdfkoljuiophkalsdfkojjlkasdf', AuthMiddleware, this.claimsController.execute);
    this.router.get('/claims', AuthMiddleware, this.claimsController.findAll);
  }
}
