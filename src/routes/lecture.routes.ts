import { Router } from "express";
import { LectureController } from "../controllers/lecture.controller";
import { Service, Container } from "typedi";
import { Routes } from "@/interfaces/routes.interface";

@Service() // Register this as a service to ensure DI works across the app
export class lectureRoute implements Routes {
  public router = Router();
  public lectureController = Container.get(LectureController);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/lectures", this.lectureController.findAll);
    this.router.post("/lectures", this.lectureController.create);
    this.router.get("/lectures/:id", this.lectureController.findOne);
    this.router.put("/lectures/:id", this.lectureController.update);
    this.router.delete("/lectures/:id", this.lectureController.delete);
  }
}

// const router = Router();
// const lectureController = new LectureController();

// router.post("/lectures", lectureController.create);
// router.get("/lectures", lectureController.findAll);
// router.get("/lectures/:id", lectureController.findOne);
// router.put("/lectures/:id", lectureController.update);
// router.delete("/lectures/:id", lectureController.delete);
