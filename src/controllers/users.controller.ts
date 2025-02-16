import { NextFunction, Request, Response } from 'express';
import { Container, Service } from 'typedi';
import { IUser } from '../interfaces/user.interface';
import { UserService } from '../services/users.service';
import { UpdateUserDto } from '../dtos/users.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
@Service()
export class UserController {
  public user = Container.get(UserService);

  public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page } = req.query;

      const findAllUsersData: IUser[] = await this.user.findAllUser(+page || 1);

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getAdminUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page } = req.query;

      const findAllUsersData: IUser[] = await this.user.findAllAdminUser(+page || 1);

      res.status(200).json({ data: findAllUsersData, message: 'findAll Admins' });
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

  public findOneUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { uid } = req.params;
    try {
      const userone = await this.user.findOneById(uid);

      res.status(200).json({ data: userone, message: 'find one user' });
    } catch (error) {
      next(error);
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
  ////////////////////////////////////////////////////////////////////////////////////////////
  public checkUsernameAvailability = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params;
      const { id } = req.user;
      if (!username) {
        res.status(400).json({ message: 'Username is required' });
        return;
      }

      const isAvailable = await this.user.isUsernameAvailable(username, id);

      if (isAvailable) {
        res.status(200).json({ available: true, message: 'Username is available' });
      } else {
        res.status(200).json({ available: false, message: 'Username is already taken' });
      }
    } catch (error) {
      next(error);
    }
  };
  //////////////////////////////////////////////////////////////////////////////////
  async stringToUsername(username: string): Promise<string> {
    const processedUsername = username
      .toLowerCase() // Convert to lowercase
      .trim() // Trim whitespace from both ends
      .replace(/[^a-z0-9_]/g, '') // Remove invalid characters except underscores
      .replace(/_+/g, '_') // Replace multiple underscores with a single underscore
      .replace(/^_+|_+$/g, ''); // Remove leading and trailing underscores

    return processedUsername;
  }

  public updateUser = async (req: RequestWithUser, res: Response): Promise<void> => {
    const id: string = req.params.id;
    const data: UpdateUserDto = req.body;
    const user = req.user;
    if (user.id !== id) {
      res.status(401).json({ message: 'Unauthorized' });
    }
    req.body.username = await this.stringToUsername(req.body.username);
    const isAvailable = await this.user.isUsernameAvailable(req.body.username, user.id);
    if (!isAvailable) {
      res.status(200).json({ available: false, message: 'Username is already taken' });
    } else
      try {
        const user = await this.user.update(id, data);
        res.status(200).json(user);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
  };
  public makeUserAddmin = async (req: RequestWithUser, res: Response): Promise<void> => {
    const id: string = req.params.id;
    const { pass } = req.body;
    // const isAddmin: boolean = req.body.isAddmin;
    // const user = req.user;
    // if (user.id !== id) {
    //   res.status(401).json({ message: 'Unauthorized' });
    // }
    try {
      const user = await this.user.userToAddmin(id, pass);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public makeAdminUser = async (req: RequestWithUser, res: Response): Promise<void> => {
    const id: string = req.params.id;
    const { pass } = req.body;
    // const isAddmin: boolean = req.body.isAddmin;
    // const user = req.user;
    // if (user.id !== id) {
    //   res.status(401).json({ message: 'Unauthorized' });
    // }
    try {
      const user = await this.user.adminToUser(id, pass);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    const id: string = req.params.id;
    const { pass } = req.body;
    try {
      const user = await this.user.deleteUserById(id, pass);
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public editFlags = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.user; // Assuming `AuthMiddleware` adds `user` to the request
    const { key, value } = req.body;

    if (!key || value === undefined) {
      res.status(400).json({ message: 'Key and value are required' });
    }

    try {
      const user = await this.user.editFlags(id, key, value);

      res.status(200).json({ data: user, message: 'flag updated' });
    } catch (error) {
      next(error);
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
    const { username } = req.params;
    try {
      const user = await this.user.getUserGame(username);
      res.status(200).json({ data: user, message: 'found' });
    } catch (error) {
      next(error);
    }
  };

  public saveGameScreenshot = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { screenshot } = req.body;
    const { id } = req.user;
    try {
      const user = await this.user.saveGameScreenshot(id, screenshot);
      res.status(200).json({ data: user, message: 'updated' });
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
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  public generateUsernamesForOldUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Call the service to generate usernames for users without a username
      const updatedUsers = await this.user.assignUsernamesToOldUsers();

      res.status(200).json({ data: updatedUsers, message: 'Usernames generated successfully' });
    } catch (error) {
      next(error);
    }
  };
  ////////////////////////////////
  public getUserByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params; // Extract the username from the request parameters

      // Call the service layer to fetch the user
      const user = await this.user.findUserByUsername(username);

      if (!user) {
        res.status(404).json({ message: `User with username "${username}" not found` });
        return;
      }

      res.status(200).json({ data: user, message: 'User fetched successfully' });
    } catch (error) {
      next(error);
    }
  };
}
