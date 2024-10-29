import { NextFunction, Request, Response } from 'express';
import { Container, Service } from 'typedi';
import { IUser } from '@/interfaces/user.interface';
import { UserService } from '@services/users.service';
import { UpdateUserDto } from '@/dtos/users.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';
@Service()
export class UserController {
  public user = Container.get(UserService);

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findAllUsersData: IUser[] = await this.user.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public claimNgcs = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    const { ngcs } = req.body;
    try {
      const claim = await this.user.claimNgcs(user, ngcs);
      res.status(201).json({ data: claim, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public getNgcs = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.user;
    try {
      const ngcs = await this.user.getNgcs(id);
      res.status(200).json({ data: ngcs, message: 'found' });
    } catch (error) {
      next(error);
    }
  };
  public getTopPoints = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.user;
    try {
      const topPoints = await this.user.getTopPoints(id);
      res.status(200).json({ data: topPoints, message: 'found' });
    } catch (error) {
      next(error);
    }
  };

  public findOneUserById = async (req: Request, res: Response): Promise<void> => {
    const id: string = req.params.id;
    try {
      const userone = await this.user.findOneById(id);

      if (userone) {
        res
          .status(200)
          .send(JSON.stringify({ data: userone, message: 'find one user' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  // public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const userId = req.params.id;
  //     const findOneUserData: IUser = await this.user.findUserById(userId);

  //     res.status(200).json({ data: findOneUserData, message: "findOne" });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: IUser = req.body;
      console.log(userData);
      const createUserData: IUser = await this.user.createUser(userData);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public findOneByAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const address: string = req.params.address;
      console.log(address);
      const user = await this.user.findByAddress(address);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
      next(error);
    }
  };

  public updateUser = async (req: RequestWithUser, res: Response): Promise<void> => {
    const id: string = req.params.id;
    const data: UpdateUserDto = req.body;
    const user = req.user;
    if (user.id !== id) {
      res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      const user = await this.user.update(id, data);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  public makeUserAddmin = async (req: RequestWithUser, res: Response): Promise<void> => {
    const id: string = req.params.id;
    // const isAddmin: boolean = req.body.isAddmin;
    // const user = req.user;
    // if (user.id !== id) {
    //   res.status(401).json({ message: 'Unauthorized' });
    // }
    try {
      const user = await this.user.userToAddmin(id);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const id: string = req.params.id;
    try {
      const user = await this.user.deleteUserById(id);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public updateGame = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { game, pointsUsed } = req.body;
    const { id } = req.params;
    const { id: userId } = req.user;
    try {
      const user = await this.user.updateGame(id, userId, game, pointsUsed);

      res.status(200).json({ data: user, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public getGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
      const user = await this.user.getUserGame(id);
      res.status(200).json({ data: user, message: 'found' });
    } catch (error) {
      next(error);
    }
  };

  public leaderBoard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page } = req.query;
      const users = await this.user.leaderBoard(+page || 1);
      res.status(200).json({ data: users, message: 'found' });
    } catch (error) {
      next(error);
    }
  };
}
