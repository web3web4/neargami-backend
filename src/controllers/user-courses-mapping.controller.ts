import { NextFunction, Request, Response } from 'express';
import { UserCoursesMappingService } from '../services/user-courses-mapping.service';
import { CreateUserCoursesMappingDto, UpdateUserCoursesMappingDto } from '../dtos/user-courses-mapping.dto';
import Container, { Inject, Service } from 'typedi';
import { IUserCoursesMapping } from '@/interfaces/user-courses-mapping.interface';
import { UserCoursesMapping } from '@prisma/client';
import { RequestWithUser } from '@/interfaces/auth.interface';

@Service()
export class UserCoursesMappingController {
  public userCoursesMappingService = Container.get(UserCoursesMappingService);
  public register = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { id: userId } = req.user;
    try {
      const userCoursesMapping: UserCoursesMapping = await this.userCoursesMappingService.register(userId, +id);
      res.status(200).send({ data: userCoursesMapping, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public findAll = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.user;
      const userCoursesMappings = await this.userCoursesMappingService.findAll(id);
      res.status(200).send({ data: userCoursesMappings, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public finsih = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const userCoursesMappings = await this.userCoursesMappingService.finish(userId, +id);
      res.status(200).send({ data: userCoursesMappings, message: 'finsih' });
    } catch (error) {
      next(error);
    }
  };

  // public findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   const { id } = req.params;
  //   try {
  //     const userCoursesMapping = await this.userCoursesMappingService.findOne(+id);
  //     if (userCoursesMapping) {
  //       res
  //         .status(200)
  //         .send(
  //           JSON.stringify({ data: userCoursesMapping, message: 'findOne' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
  //         );
  //     } else {
  //       res.status(404).json({ message: 'UserCoursesMapping not found' });
  //     }
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };

  // public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   const id = BigInt(req.params.id);
  //   const data: UpdateUserCoursesMappingDto = req.body;
  //   try {
  //     const userCoursesMapping = await this.userCoursesMappingService.update(id, data);
  //     res
  //       .status(200)
  //       .send(
  //         JSON.stringify({ data: userCoursesMapping, message: 'updated' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
  //       );
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };

  // public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   const id = BigInt(req.params.id);
  //   try {
  //     const userCoursesMapping = await this.userCoursesMappingService.delete(id);
  //     res
  //       .status(200)
  //       .send(
  //         JSON.stringify({ data: userCoursesMapping, message: 'deleted' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
  //       );
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };
}
