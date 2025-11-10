import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { Routes } from '../interfaces/routes.interface';
import { Service, Container } from 'typedi';
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
    this.router.post(`${this.path}ethersignup`, this.auth.etherSignUp);
    this.router.post(`${this.path}block`, this.auth.blockUser);
    this.router.post(`${this.path}telegram`, this.auth.authenticateWithTelegram);
    // this.router.post(`${this.path}login`, ValidationMiddleware(CreateUserDto), this.auth.logIn);
    // this.router.post(`${this.path}logout`, AuthMiddleware, this.auth.logOut);
  }
}
