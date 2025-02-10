import { Router } from 'express';
import { Service, Container } from 'typedi';
import { Routes } from '../interfaces/routes.interface';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { LogController } from '@/controllers/logs.controller';

@Service() // Register this as a service to ensure DI works across the app
export class LogsRoute implements Routes {
  public router = Router();
  public logsController = Container.get(LogController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/logs/', AuthMiddleware, this.logsController.getLogs);
  }
}
