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
  public createChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { challange, message } = this.auth.createChallenge();
      res.status(200).json({ challange, message });
    } catch (error) {
      next(error);
    }
  };

  public createNewChallenge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const accountid: string = req.params.accountId;
    console.log(accountid);
    try {
      const newUser = await this.auth.checkUser(accountid);
      console.log(newUser);
      if (newUser) {
        //this is first time ...must create a challenge and store user in challengeLog.......
        const { challange, message } = this.auth.createChallenge();
        console.log({ challange, message });
        const createchallangelog = await this.auth.createChallangeLog(accountid, challange);
        console.log(createchallangelog);
        res.status(200).json({ challange, message, createchallangelog });
      } else {
        const isSignature = await this.auth.checkSignature(accountid);
        if (isSignature) {
          //return same challange to signature until pass it
          const { challange, message } = await this.auth.returnSameChallenge(accountid);

          res.status(200).json({ challange, message });
        } else {
          //create new challange to this user
          const { challange, message } = this.auth.createChallenge();

          const createchallangelog = await this.auth.createChallangeLog(accountid, challange);
          res.status(200).json({ challange, message, createchallangelog });
        }
      }
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
      const signUpUserData: User = await this.auth.validateAndCreateUser(req.body);
      const authenticate = await this.auth.createToken(signUpUserData.id);
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
