import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.user.getUsers);
    this.router.get(`${this.path}/game/:id`, this.user.getGame);
    this.router.get('/users/:id', this.user.findOneUserById);
    this.router.put(`${this.path}/game/:id`, AuthMiddleware, this.user.updateGame);
    this.router.put(`${this.path}/:id`, AuthMiddleware, ValidationMiddleware(UpdateUserDto, false, true, true), this.user.updateUser);
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.user.deleteUser);
    // this.router.get(`${this.path}/:address`, this.user.findOneByAddress);
    // this.router.get(`${this.path}/:`, this.user.getUserById);
    // this.router.get(`${this.path}/:id(\\d+)`, this.user.getUserById);
    // this.router.post("/users", this.user.create);
    // this.router.get("/users", this.user.findAll);
    // this.router.put(`${this.path}/:id(\\d+)`, ValidationMiddleware(CreateUserDto, true), this.user.updateUser);
    // this.router.delete(`${this.path}/:id(\\d+)`, this.user.deleteUser);
  }
}
