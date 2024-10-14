import { Request, Response } from 'express';
import { QuestionService } from '../services/question.service';
import { CreateQuestionDto, UpdateQuestionDto } from '../dtos/question.dto';
import Container, { Service } from 'typedi';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Question } from '@prisma/client';

@Service()
export class QuestionController {
  public questionService = Container.get(QuestionService);

  public create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<Question> => {
    const data: CreateQuestionDto = req.body;
    const { courseId, lectureId } = req.params;
    const { id } = req.user;
    try {
      const question = await this.questionService.create(+courseId, +lectureId, id, data);
      res.status(200).send({ data: question, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const questions = await this.questionService.findAll();
      const processedquestions = questions.map(question => ({
        ...question,
        id: question.id.toString(),

        // Assuming 'id' is a BigInt field
      }));

      res
        .status(200)
        .send(
          JSON.stringify({ data: processedquestions, message: 'findAll' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findOne = async (req: Request, res: Response): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const question = await this.questionService.findOne(id);
      if (question) {
        res
          .status(200)
          .send(JSON.stringify({ data: question, message: 'found' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
      } else {
        res.status(404).json({ message: 'Question not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const id = BigInt(req.params.id);
    const data: UpdateQuestionDto = req.body;
    try {
      const question = await this.questionService.update(id, data);
      res
        .status(200)
        .send(JSON.stringify({ data: question, message: 'updated' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const question = await this.questionService.delete(id);
      res
        .status(200)
        .send(JSON.stringify({ data: question, message: 'deleted' }, (key, value) => (typeof value === 'bigint' ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
