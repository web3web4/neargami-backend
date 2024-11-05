import { NextFunction, Request, Response } from 'express';
import { Container, Inject, Service } from 'typedi';
import { RequestWithUser } from '@interfaces/auth.interface';
import { IUser } from '@/interfaces/user.interface';
import { AuthService } from '@services/auth.service';
import { User, challangelog } from '@prisma/client';
import Jwt from 'jsonwebtoken';
@Service()
export class AuthController {
  constructor(@Inject(() => AuthService) private auth: AuthService) {
    console.log('Authcontrollr initialized');
  }
  public validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // const userData: User = req.body;
      const signUpUserData = await this.auth.authenticate(req.body);
      res.status(201).json({ data: signUpUserData, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };
  public checkChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;

      res.status(200).json({ data: this.auth.checkChallenge(data) });
    } catch (error) {
      next(error);
    }
  };
  public createChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: challangelog = req.body;
    try {
      const newUser = await this.auth.checkUser(data.accountId);
      if (newUser) {
        const { challange, message } = this.auth.createChallenge();
        res.status(200).json({ challange, message });
      } else {
        res.status(200).json({ data: 'this user is already exsist' });
      }
      // const checkChallenge = await this.auth.checkChallenge(data.accountId);

      // const { challange, message } = this.auth.createChallenge();
      // res.status(200).json({ challange, message });
    } catch (error) {
      next(error);
    }
  };
  public getAllChallangeLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // const userData: User = req.body;
      const challangelog = await this.auth.getallchallangeLog();

      res.status(201).json({ data: challangelog, message: 'all logs' });
    } catch (error) {
      next(error);
    }
  };
  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // const userData: User = req.body;
      const signUpUserData: User = await this.auth.createUser(req.body);
      const authenticate = await this.auth.authenticate(req.body);
      res.status(201).json({ data: { signUpUserData, authenticate }, message: 'signup' });
    } catch (error) {
      next(error);
    }
  };

  // public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const userData: User = req.body;
  //     const { cookie, findUser } = await this.auth.login(userData);
  //     res.setHeader('Set-Cookie', [cookie]);
  //     res.status(200).json({ data: findUser, message: 'login' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  // public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const userData: User = req.user;
  //     const logOutUserData: User = await this.auth.logout(userData);
  //     res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
  //     res.status(200).json({ data: logOutUserData, message: 'logout' });
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
