import { NextFunction, Request, Response } from 'express';
import { UserLectureMappingService } from '../services/user-lecture-mapping.service';
import { CreateUserLectureMappingDto, UpdateUserLectureMappingDto } from '../dtos/user-lecture-mapping.dto';
import Container, { Inject, Service } from 'typedi';
import { IUserLectureMapping } from '@/interfaces/user-lecture-mapping.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { UserLectureMapping } from '@prisma/client';

@Service()
export class UserLectureMappingController {
  public userLectureMappingService = Container.get(UserLectureMappingService);
  public register = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { courseId, id } = req.params;
    const { id: userId } = req.user;
    try {
      const userCreateLectures: UserLectureMapping = await this.userLectureMappingService.register(userId, +courseId, +id);

      res.status(200).send({ data: userCreateLectures, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public findAll = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.user;
      const { courseId } = req.params;
      const findAll: UserLectureMapping[] = await this.userLectureMappingService.findAll(id, +courseId);

      res.status(200).send({ data: findAll, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  // public findOne = async (req: Request, res: Response, next: Function): Promise<void> => {
  //   const id = BigInt(req.params.id);
  //   try {
  //     const userLectureMapping: IUserLectureMapping = await this.userLectureMappingService.findOne(id);
  //     if (userLectureMapping) {
  //       res
  //         .status(200)
  //         .send(
  //           JSON.stringify({ data: userLectureMapping, message: 'findOne' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
  //         );
  //     } else {
  //       res.status(404).json({ message: 'userLectureMapping not found' });
  //     }
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };

  // public update = async (req: Request, res: Response, next: Function): Promise<void> => {
  //   const id = BigInt(req.params.id);
  //   const data: UpdateUserLectureMappingDto = req.body;
  //   try {
  //     const userLectureMapping = await this.userLectureMappingService.update(id, data);
  //     res
  //       .status(200)
  //       .send(
  //         JSON.stringify({ data: userLectureMapping, message: 'updated' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
  //       );
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };

  // public delete = async (req: Request, res: Response, next: Function): Promise<void> => {
  //   const id = BigInt(req.params.id);
  //   try {
  //     const userLectureMapping = await this.userLectureMappingService.delete(id);
  //     res
  //       .status(200)
  //       .send(
  //         JSON.stringify({ data: userLectureMapping, message: 'delete' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
  //       );
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };
}
