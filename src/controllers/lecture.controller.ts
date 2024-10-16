import { NextFunction, Request, Response } from 'express';
import { LectureService } from '../services/lecture.service';
import { CreateLectureDto, UpdateLectureDto, UpdateLectureOrderArrayDto } from '../dtos/lecture.dto';
import Container, { Service } from 'typedi';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Lecture } from '@prisma/client';

@Service()
export class LectureController {
  public lectureService = Container.get(LectureService);

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const createLectureDto: CreateLectureDto = req.body;
    const { courseId } = req.params;
    const { id } = req.user;
    try {
      const lecture = await this.lectureService.create(id, +courseId, createLectureDto);
      res.status(201).send({ data: lecture, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId } = req.params;
      const lectures: Lecture[] = await this.lectureService.findAll(+courseId);

      res.status(200).send({ data: lectures, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { courseId } = req.params;
    try {
      const lecture: Lecture = await this.lectureService.findOne(+id, +courseId);

      res.status(200).send({ data: lecture, message: 'found' });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id, courseId } = req.params;
    const userId = req.user.id;
    const data: UpdateLectureDto = req.body;
    try {
      const lecture = await this.lectureService.update(+id, +courseId, userId, data);
      res.status(200).send({ data: lecture, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };
  public updateOrders = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { courseId } = req.params;
    const userId = req.user.id;
    const data: UpdateLectureOrderArrayDto = req.body;
    try {
      const lectures = await this.lectureService.updateOrders(+courseId, userId, data);
      res.status(200).send({ data: lectures, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const { id, courseId } = req.params;
    const userId = req.user.id;
    try {
      const lecture = await this.lectureService.delete(+id, +courseId, userId);
      res.status(200).send({ data: lecture, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
