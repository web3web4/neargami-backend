import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { Routes } from '../interfaces/routes.interface';
import { Service, Container } from 'typedi';
import { AuthService } from '@/services/auth.service';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { CreateUserDto } from '@/dtos/users.dto';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
@Service()
export class AuthRoute implements Routes {
  public path = '/auth/';
  public router = Router();
  public auth = Container.get(AuthController);
  //public auth = new AuthController(new AuthService());

  //public auth = Container.get(AuthController);

  constructor() {
    console.log('initializetion auth route');
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post(`${this.path}validate`, this.auth.validate);
   // this.router.post(`${this.path}checkchallenge`, this.auth.checkChallenge);
    this.router.get(`${this.path}challenge/:accountId`, this.auth.createNewChallenge);
    this.router.get(`${this.path}challenge`, this.auth.createChallenge);
    this.router.get(`${this.path}challengelog`, this.auth.getAllChallangeLog);
    this.router.post(`${this.path}signup`, this.auth.createUser);
    // this.router.post(`${this.path}login`, ValidationMiddleware(CreateUserDto), this.auth.logIn);
    // this.router.post(`${this.path}logout`, AuthMiddleware, this.auth.logOut);
  }
}
