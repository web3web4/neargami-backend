import { NextFunction, Request, Response } from 'express';
import { QuestionService } from '../services/question.service';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import Container, { Service } from 'typedi';
import { RequestWithUser } from '@/interfaces/auth.interface';

@Service()
export class QuestionController {
  public questionService = Container.get(QuestionService);

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    const data: CreateQuestionDto = req.body;
    const { courseId, lectureId } = req.params;
    const { id } = req.user;
    try {
      const question = await this.questionService.create(+courseId, +lectureId, id, data);
      res.status(201).send({ data: question, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { courseId, lectureId } = req.params;
      const questions = await this.questionService.findAll(+courseId, +lectureId);

      res.status(200).send({ data: questions, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public findOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId, lectureId } = req.params;
      const question = await this.questionService.findOne(+courseId, +lectureId, +id);

      res.status(200).send({ data: question, message: 'found' });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId, lectureId } = req.params;
      const { id: userId } = req.user;
      const data: UpdateQuestionDto = req.body;
      const question = await this.questionService.update(+id, +courseId, +lectureId, userId, data);
      res.status(200).send({ data: question, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, courseId, lectureId } = req.params;
      const { id: userId } = req.user;
      const question = await this.questionService.delete(+id, +courseId, +lectureId, userId);
      res.status(200).send({ data: question, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };
}
