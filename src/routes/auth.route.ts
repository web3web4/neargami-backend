import { Router } from 'express';
import { AuthController } from '@controllers/auth.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

export class AuthRoute implements Routes {
  public path = '/auth/';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}validate`, this.auth.validate);
    this.router.get(`${this.path}challenge`, this.auth.createChallenge);
    this.router.post(`${this.path}signup`, this.auth.createUser);
    // this.router.post(`${this.path}logout`, AuthMiddleware, this.auth.logOut);
  }
}
