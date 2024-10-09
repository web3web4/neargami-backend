import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";
import { Service, Container } from "typedi";
import { Routes } from "@/interfaces/routes.interface";

@Service() // Register this as a service to ensure DI works across the app
export class QuestionRoute implements Routes {
  public router = Router();
  public questionController = Container.get(QuestionController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/questions", this.questionController.create);
    this.router.get("/questions", this.questionController.findAll);
    this.router.get("/questions/:id", this.questionController.findOne);
    this.router.put("/questions/:id", this.questionController.update);
    this.router.delete("/questions/:id", this.questionController.delete);
  }
}
