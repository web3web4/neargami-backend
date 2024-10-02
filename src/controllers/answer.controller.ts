import { Request, Response } from "express";
import { AnswerService } from "../services/answer.service";
import { CreateAnswerDto, UpdateAnswerDto } from "../dtos/answer.dto";
import { Inject, Service } from "typedi";


@Service()
export class AnswerController {

  constructor(@Inject(() => AnswerService) private answerService: AnswerService) {
    console.log("AnswerController initialized");
  }

  public create = async (req: Request, res: Response): Promise<void> => {
    const data: CreateAnswerDto = req.body;
    try {
      const answer = await this.answerService.create(data);
      res
        .status(200)
        .send(JSON.stringify({ data: answer, message: "created" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const answers = await this.answerService.findAll();
      const processedanswers= answers.map(question => ({
        ...question,
        id: question.id.toString(),

        // Assuming 'id' is a BigInt field
      }));

      res
        .status(200)
        .send(
          JSON.stringify({ data: processedanswers, message: "findAll" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)),
        );
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public findOne = async (req: Request, res: Response): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const answer = await this.answerService.findOne(id);
      if (answer) {
        res
          .status(200)
          .send(JSON.stringify({ data: answer, message: "found" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
      } else {
        res.status(404).json({ message: "Answer not found" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const id = BigInt(req.params.id);
    const data: UpdateAnswerDto = req.body;
    try {
      const answer = await this.answerService.update(id, data);
      res
        .status(200)
        .send(JSON.stringify({ data: answer, message: "updated" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    const id = BigInt(req.params.id);
    try {
      const answer = await this.answerService.delete(id);
      res
        .status(200)
        .send(JSON.stringify({ data: answer, message: "deleted" }, (key, value) => (typeof value === "bigint" ? value.toString() : value)));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
