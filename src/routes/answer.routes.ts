import { Router } from "express";
import { AnswerController } from "../controllers/answer.controller";
import { Service, Container } from "typedi";
import { Routes } from "@/interfaces/routes.interface";

@Service() // Register this as a service to ensure DI works across the app
export class AnswerRoute implements Routes {
  public router = Router();
  public answerController = Container.get(AnswerController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/answers", this.answerController.create);
    this.router.get("/answers", this.answerController.findAll);
    this.router.get("/answers/:id", this.answerController.findOne);
    this.router.put("/answers/:id", this.answerController.update);
    this.router.delete("/answers/:id", this.answerController.delete);
  }
}
