import { Request, Response } from "express";
import { QuestionService } from "../services/question.service";
import { CreateQuestionDto, UpdateQuestionDto } from "../dtos/question.dto";
import { Inject, Service } from "typedi";


@Service()
export class QuestionController {
  constructor(@Inject(() => QuestionService) private questionService: QuestionService) {
    console.log("QuestionController initialized");
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const data: CreateQuestionDto = req.body;
    try {
      const question = await this.questionService.create(data);
      res
        .status(200)
        .send(JSON.stringify({ data: question, message: "created" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
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
          JSON.stringify({ data: processedquestions, message: "findAll" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
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
          .send(JSON.stringify({ data: question, message: "found" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
      } else {
        res.status(404).json({ message: "Question not found" });
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
        .send(JSON.stringify({ data: question, message: "updated" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
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
        .send(JSON.stringify({ data: question, message: "deleted" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
