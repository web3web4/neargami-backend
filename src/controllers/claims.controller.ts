import { Request, Response, NextFunction } from 'express';
import Container, { Service } from 'typedi';

import { ClaimsService } from '@/services/claims.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

@Service() // Add this decorator to register CourseController
export class ClaimsController {
  public claimService = Container.get(ClaimsService);

  public execute = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    try {
      await this.claimService.execute(user.isAdmin);
      res.status(201).json({ message: 'executed' });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public findAll = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    try {
      const claims = await this.claimService.findAll(user.isAdmin);
      res.status(201).json({ data: claims, message: 'executed' });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
}
