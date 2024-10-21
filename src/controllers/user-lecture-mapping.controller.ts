import { NextFunction, Response } from 'express';
import { UserLectureMappingService } from '../services/user-lecture-mapping.service';
import Container, { Service } from 'typedi';
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
  public answer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { courseId, lectureId, questionId } = req.params;
    const { id: userId } = req.user;
    const { answerId } = req.body;
    try {
      const userCreateLectures: boolean = await this.userLectureMappingService.answerMany(userId, +courseId, +lectureId, +questionId, answerId);

      res.status(200).send({ data: userCreateLectures, message: 'answered' });
    } catch (error) {
      next(error);
    }
  };
  public finish = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { courseId, id } = req.params;
    const { id: userId } = req.user;
    try {
      const userCreateLectures: UserLectureMapping = await this.userLectureMappingService.finish(userId, +courseId, +id);

      res.status(200).send({ data: userCreateLectures, message: 'updated' });
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
